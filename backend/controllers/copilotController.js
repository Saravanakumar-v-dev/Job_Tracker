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
    const resumeDraft = buildResumeDraft({
        resumeText,
        optimization,
        fileName: req.body.fileName,
        candidateName: req.body.candidateName,
        targetRole: normalizedTargetRole,
        companyName: normalizedCompanyName,
    });

    // Recalculate analysis using the newly optimized resume draft text
    const updatedAnalysis = buildAnalysisResponse({
        resumeText: resumeDraft.plainText,
        jobDescription: req.body.jobDescription,
    });

    res.status(200).json({
        resumeText,
        analysis: updatedAnalysis,
        resumeDraft,
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
