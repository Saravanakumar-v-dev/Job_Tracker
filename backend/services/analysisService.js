const pdfParse = require('pdf-parse');
const { createHttpError } = require('../utils/httpError');
const {
    clampNumber,
    round,
    uniqueValues,
    normalizeText,
    extractJobSignals,
    extractBulletLines,
    calculateResumeQuality,
    toDisplayLabel,
} = require('../utils/text');

const decodePdfBuffer = (resumeFileData = '') => {
    const base64Payload = resumeFileData.includes(',')
        ? resumeFileData.split(',').pop()
        : resumeFileData;

    if (!base64Payload) {
        throw createHttpError(400, 'Resume file payload is missing.');
    }

    return Buffer.from(base64Payload, 'base64');
};

const extractResumeText = async ({ resumeText, resumeFileData, fileName } = {}) => {
    if (resumeText?.trim()) {
        return resumeText.trim();
    }

    if (!resumeFileData) {
        throw createHttpError(400, 'Provide resume text or a PDF file to continue.');
    }

    if (fileName && !fileName.toLowerCase().endsWith('.pdf')) {
        throw createHttpError(400, 'Only PDF resumes are supported for upload.');
    }

    const pdfBuffer = decodePdfBuffer(resumeFileData);
    const parsed = await pdfParse(pdfBuffer);
    const parsedText = parsed.text?.replace(/\s+\n/g, '\n').trim();

    if (!parsedText) {
        throw createHttpError(422, 'The uploaded PDF could not be parsed into readable text.');
    }

    return parsedText;
};

const buildCoverageSummary = ({ matchedSkills, missingSkills, matchedKeywords, missingKeywords, qualityScore }) => {
    const skillMessage = matchedSkills.length
        ? `${matchedSkills.length} required skills already appear in the resume.`
        : 'The resume is not surfacing the target skills clearly yet.';

    const keywordMessage = missingKeywords.length
        ? `${missingKeywords.length} important keywords are still missing.`
        : 'Core job keywords are well covered.';

    const qualityMessage = qualityScore >= 75
        ? 'Formatting and content quality look strong for ATS screening.'
        : 'Resume quality can improve with tighter achievements and clearer sections.';

    return [skillMessage, keywordMessage, qualityMessage].join(' ');
};

const analyzeResumeMatch = ({ resumeText, jobDescription }) => {
    if (!resumeText?.trim() || !jobDescription?.trim()) {
        throw createHttpError(400, 'Resume text and job description are both required for analysis.');
    }

    const normalizedResume = normalizeText(resumeText);
    const { skills: jobSkills, keywords: jobKeywords } = extractJobSignals(jobDescription);

    const matchedSkills = jobSkills.filter((skill) => normalizedResume.includes(normalizeText(skill)));
    const missingSkills = jobSkills.filter((skill) => !normalizedResume.includes(normalizeText(skill)));
    const matchedKeywords = jobKeywords.filter((keyword) => normalizedResume.includes(normalizeText(keyword)));
    const missingKeywords = jobKeywords.filter((keyword) => !normalizedResume.includes(normalizeText(keyword)));
    const keywordMatchPercentage = jobKeywords.length
        ? round((matchedKeywords.length / jobKeywords.length) * 100, 0)
        : 0;
    const skillMatchPercentage = jobSkills.length
        ? round((matchedSkills.length / jobSkills.length) * 100, 0)
        : keywordMatchPercentage;
    const resumeQuality = calculateResumeQuality(resumeText);

    const atsScore = clampNumber(
        round(
            (keywordMatchPercentage * 0.45)
            + (skillMatchPercentage * 0.35)
            + (resumeQuality.score * 0.20),
            0,
        ),
    );

    const focusAreas = uniqueValues([
        ...missingSkills.slice(0, 4).map((skill) => `Highlight hands-on results with ${toDisplayLabel(skill)}.`),
        ...missingKeywords.slice(0, 4).map((keyword) => `Mirror the language around "${keyword}" where it is truthfully relevant.`),
        ...resumeQuality.risks.slice(0, 3),
    ]).slice(0, 6);

    return {
        atsScore,
        keywordMatchPercentage,
        skillMatchPercentage,
        matchedKeywords,
        missingKeywords,
        matchedSkills,
        missingSkills,
        resumeQuality,
        resumeQualityScore: resumeQuality.score,
        focusAreas,
        coverageSummary: buildCoverageSummary({
            matchedSkills,
            missingSkills,
            matchedKeywords,
            missingKeywords,
            qualityScore: resumeQuality.score,
        }),
    };
};

const predictInterviewProbability = ({
    atsScore,
    skillMatchPercentage,
    resumeQualityScore,
    missingSkillsCount = 0,
} = {}) => {
    const penalty = Math.min(missingSkillsCount * 2.5, 12);

    const interviewProbability = clampNumber(
        round(
            (Number(atsScore || 0) * 0.5)
            + (Number(skillMatchPercentage || 0) * 0.3)
            + (Number(resumeQualityScore || 0) * 0.2)
            - penalty,
            0,
        ),
    );

    let outlook = 'Needs work';
    if (interviewProbability >= 75) outlook = 'High potential';
    else if (interviewProbability >= 55) outlook = 'Promising';
    else if (interviewProbability >= 35) outlook = 'Competitive if improved';

    const drivers = uniqueValues([
        Number(atsScore || 0) >= 70 ? 'Strong ATS alignment is helping.' : 'Keyword coverage is still holding the resume back.',
        Number(skillMatchPercentage || 0) >= 65 ? 'Skill alignment looks recruiter-friendly.' : 'Several requested skills are not visible enough.',
        Number(resumeQualityScore || 0) >= 70 ? 'Resume quality signals are solid.' : 'Resume structure and impact statements can be strengthened.',
    ]);

    return {
        interviewProbability,
        outlook,
        drivers,
    };
};

const rewriteBulletPoint = (bulletPoint, focusKeywords = []) => {
    const cleaned = bulletPoint.replace(/^[-*•]\s*/, '').trim();
    const focusPhrase = focusKeywords.slice(0, 2).join(' and ');

    if (!cleaned) {
        return null;
    }

    if (/\b\d/.test(cleaned)) {
        return `Delivered ${cleaned.charAt(0).toLowerCase()}${cleaned.slice(1)} while connecting the outcome to ${focusPhrase || 'the target role requirements'}.`;
    }

    return `Led ${cleaned.charAt(0).toLowerCase()}${cleaned.slice(1)}, emphasizing ${focusPhrase || 'business impact'} and measurable results.`;
};

const buildHeuristicSuggestions = ({ resumeText, jobDescription, analysis }) => {
    const bulletCandidates = extractBulletLines(resumeText).slice(0, 3);
    const focusKeywords = [
        ...(analysis?.missingSkills || []).slice(0, 3),
        ...(analysis?.missingKeywords || []).slice(0, 3),
    ];

    const suggestedImprovements = uniqueValues([
        ...(analysis?.missingSkills || []).slice(0, 4).map((skill) => `Add concrete evidence that shows you have worked with ${skill}.`),
        ...(analysis?.resumeQuality?.risks || []).slice(0, 3),
        'Tailor the summary section so it directly echoes the role scope and business domain.',
        'Use numbers, outcomes, and ownership language in the first few bullets of each recent role.',
    ]).slice(0, 6);

    const rewrittenBulletPoints = uniqueValues(
        bulletCandidates
            .map((bullet) => rewriteBulletPoint(bullet, focusKeywords))
            .filter(Boolean),
    ).slice(0, 3);

    return {
        provider: 'heuristic',
        summary: analysis?.coverageSummary || 'The resume can be tightened further around the target role.',
        suggestedImprovements,
        missingSkills: (analysis?.missingSkills || []).slice(0, 8),
        rewrittenBulletPoints,
    };
};

module.exports = {
    extractResumeText,
    analyzeResumeMatch,
    predictInterviewProbability,
    buildHeuristicSuggestions,
};
