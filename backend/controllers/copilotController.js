const {
    extractResumeText,
    analyzeResumeMatch,
    predictInterviewProbability,
} = require('../services/analysisService');
const { generateResumeSuggestions } = require('../services/openAIService');
const { extractJobDetails } = require('../services/jobExtractionService');

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
