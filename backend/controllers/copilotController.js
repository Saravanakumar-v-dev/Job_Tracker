const {
    extractResumeText,
    analyzeResumeMatch,
    predictInterviewProbability,
} = require('../services/analysisService');
const {
    generateResumeSuggestions,
    optimizeResumeForRole,
} = require('../services/openAIService');
const { extractJobDetails } = require('../services/jobExtractionService');
const { buildResumeDraft } = require('../services/resumeDraftService');
const { sanitizeCompanyName, sanitizeRoleTitle } = require('../utils/text');

const buildAnalysisResponse = ({ resumeText, jobDescription }) => {
    const analysis = analyzeResumeMatch({ resumeText, jobDescription });
    const prediction = predictInterviewProbability({
        atsScore: analysis.atsScore,
        skillMatchPercentage: analysis.skillMatchPercentage,
        resumeQualityScore: analysis.resumeQualityScore,
        missingSkillsCount: analysis.missingSkills.length,
    });

    return {
        resumeText,
        ...analysis,
        ...prediction,
    };
};

const ATS_TARGET_MIN = 82;
const ATS_TARGET_MAX = 90;

const buildAtsGapChecklist = (analysis = {}) => {
    const checklist = [];

    if ((analysis.skillMatchPercentage || 0) < 75) {
        checklist.push(
            `Skill alignment is ${analysis.skillMatchPercentage || 0}%. Add more role-required tools and technologies in Skills and Experience sections.`,
        );
    }

    if ((analysis.keywordMatchPercentage || 0) < 70) {
        checklist.push(
            `Keyword coverage is ${analysis.keywordMatchPercentage || 0}%. Mirror exact terms from the job description in summary and top bullets.`,
        );
    }

    if ((analysis.resumeQualityScore || 0) < 75) {
        checklist.push(
            `Resume quality score is ${analysis.resumeQualityScore || 0}%. Improve structure, quantified outcomes, and section clarity.`,
        );
    }

    if ((analysis.missingSkills || []).length) {
        checklist.push(
            `Missing skills still detected: ${(analysis.missingSkills || []).slice(0, 6).join(', ')}.`,
        );
    }

    if ((analysis.missingKeywords || []).length) {
        checklist.push(
            `Missing keywords still detected: ${(analysis.missingKeywords || []).slice(0, 6).join(', ')}.`,
        );
    }

    if (!checklist.length) {
        checklist.push('No major ATS blockers detected; refine wording and metrics to move into the upper target range.');
    }

    return checklist.slice(0, 6);
};

exports.analyzeResume = async (req, res) => {
    const resumeText = await extractResumeText({
        resumeText: req.body.resumeText,
        resumeFileData: req.body.resumeFileData,
        fileName: req.body.fileName,
    });

    const result = buildAnalysisResponse({
        resumeText,
        jobDescription: req.body.jobDescription,
    });

    res.status(200).json(result);
};

exports.generateSuggestions = async (req, res) => {
    const resumeText = await extractResumeText({
        resumeText: req.body.resumeText,
        resumeFileData: req.body.resumeFileData,
        fileName: req.body.fileName,
    });
    const analysis = buildAnalysisResponse({
        resumeText,
        jobDescription: req.body.jobDescription,
    });
    const suggestions = await generateResumeSuggestions({
        resumeText,
        jobDescription: req.body.jobDescription,
        analysis,
    });

    res.status(200).json({
        resumeText,
        ...suggestions,
    });
};

exports.optimizeResume = async (req, res) => {
    const normalizedTargetRole = sanitizeRoleTitle(req.body.targetRole);
    const normalizedCompanyName = sanitizeCompanyName(req.body.companyName);
    const resumeText = await extractResumeText({
        resumeText: req.body.resumeText,
        resumeFileData: req.body.resumeFileData,
        fileName: req.body.fileName,
    });
    const originalAnalysis = buildAnalysisResponse({
        resumeText,
        jobDescription: req.body.jobDescription,
    });
    const optimization = await optimizeResumeForRole({
        resumeText,
        jobDescription: req.body.jobDescription,
        targetRole: normalizedTargetRole,
        companyName: normalizedCompanyName,
        analysis: originalAnalysis,
    });
    let resumeDraft = buildResumeDraft({
        resumeText,
        optimization,
        fileName: req.body.fileName,
        candidateName: req.body.candidateName,
        targetRole: normalizedTargetRole,
        companyName: normalizedCompanyName,
        analysis: originalAnalysis,
        enforceKeywordCoverage: false,
    });

    // Recalculate analysis using the newly optimized resume draft text
    let updatedAnalysis = buildAnalysisResponse({
        resumeText: resumeDraft.plainText,
        jobDescription: req.body.jobDescription,
    });

    // If the first pass is still below target ATS band, add a dedicated ATS
    // keyword coverage section while keeping language truthful and role-focused.
    if (updatedAnalysis.atsScore < ATS_TARGET_MIN) {
        resumeDraft = buildResumeDraft({
            resumeText,
            optimization,
            fileName: req.body.fileName,
            candidateName: req.body.candidateName,
            targetRole: normalizedTargetRole,
            companyName: normalizedCompanyName,
            analysis: updatedAnalysis,
            enforceKeywordCoverage: true,
        });

        updatedAnalysis = buildAnalysisResponse({
            resumeText: resumeDraft.plainText,
            jobDescription: req.body.jobDescription,
        });
    }

    res.status(200).json({
        resumeText,
        analysis: updatedAnalysis,
        resumeDraft,
        atsGapChecklist: buildAtsGapChecklist(updatedAnalysis),
        atsTargetBand: {
            min: ATS_TARGET_MIN,
            max: ATS_TARGET_MAX,
            achieved: updatedAnalysis.atsScore,
        },
        ...optimization,
    });
};

exports.predictInterview = async (req, res) => {
    if (req.body.jobDescription && (req.body.resumeText || req.body.resumeFileData)) {
        const resumeText = await extractResumeText({
            resumeText: req.body.resumeText,
            resumeFileData: req.body.resumeFileData,
            fileName: req.body.fileName,
        });
        const analysis = buildAnalysisResponse({
            resumeText,
            jobDescription: req.body.jobDescription,
        });

        return res.status(200).json(analysis);
    }

    const prediction = predictInterviewProbability({
        atsScore: req.body.atsScore,
        skillMatchPercentage: req.body.skillMatchPercentage,
        resumeQualityScore: req.body.resumeQualityScore,
        missingSkillsCount: req.body.missingSkillsCount,
    });

    return res.status(200).json(prediction);
};

exports.extractJobFromUrl = async (req, res) => {
    const extractedJob = await extractJobDetails(req.body.url);
    res.status(200).json(extractedJob);
};
