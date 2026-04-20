const {
    buildHeuristicSuggestions,
    buildHeuristicResumeOptimization,
} = require('./analysisService');
const {
    uniqueValues,
    toDisplayLabel,
} = require('../utils/text');

const RESPONSE_SCHEMA = {
    type: 'object',
    additionalProperties: false,
    required: ['summary', 'suggestedImprovements', 'missingSkills', 'rewrittenBulletPoints'],
    properties: {
        summary: { type: 'string' },
        suggestedImprovements: {
            type: 'array',
            items: { type: 'string' },
            minItems: 3,
            maxItems: 6,
        },
        missingSkills: {
            type: 'array',
            items: { type: 'string' },
            maxItems: 8,
        },
        rewrittenBulletPoints: {
            type: 'array',
            items: { type: 'string' },
            minItems: 2,
            maxItems: 4,
        },
    },
};

const OPTIMIZATION_SCHEMA = {
    type: 'object',
    additionalProperties: false,
    required: [
        'optimizedHeadline',
        'professionalSummary',
        'optimizedSkills',
        'optimizedBulletPoints',
        'keywordIncorporationTips',
        'optimizationNotes',
    ],
    properties: {
        optimizedHeadline: { type: 'string' },
        professionalSummary: { type: 'string' },
        optimizedSkills: {
            type: 'array',
            items: { type: 'string' },
            minItems: 4,
            maxItems: 20,
        },
        optimizedBulletPoints: {
            type: 'array',
            items: { type: 'string' },
            minItems: 2,
            maxItems: 5,
        },
        keywordIncorporationTips: {
            type: 'array',
            items: { type: 'string' },
            minItems: 3,
            maxItems: 6,
        },
        optimizationNotes: {
            type: 'array',
            items: { type: 'string' },
            minItems: 3,
            maxItems: 5,
        },
    },
};

const extractOutputText = (payload) => {
    if (typeof payload.output_text === 'string' && payload.output_text.trim()) {
        return payload.output_text;
    }

    const messageItem = payload.output?.find((item) => item.type === 'message');
    const outputText = messageItem?.content?.find((item) => item.type === 'output_text')?.text;

    return outputText || null;
};

const startWithActionVerb = (line = '') => {
    const cleaned = line.replace(/^[-*•]\s*/, '').trim();
    if (!cleaned) {
        return cleaned;
    }

    if (/^(led|built|created|developed|designed|implemented|delivered|drove|optimized|managed|owned)\b/i.test(cleaned)) {
        return cleaned;
    }

    return `Delivered ${cleaned.charAt(0).toLowerCase()}${cleaned.slice(1)}`;
};

const strengthenOptimizationPayload = ({ payload, analysis = {}, targetRole = '' }) => {
    const requiredTerms = uniqueValues([
        ...(analysis.missingSkills || []),
        ...(analysis.missingKeywords || []),
        ...(analysis.matchedSkills || []),
    ]).slice(0, 12).map(toDisplayLabel);

    const existingSkillSet = new Set((payload.optimizedSkills || []).map((item) => item.toLowerCase()));
    const mergedSkills = uniqueValues([
        ...(payload.optimizedSkills || []),
        ...requiredTerms.filter((term) => !existingSkillSet.has(term.toLowerCase())),
    ]).slice(0, 16);

    const rewrittenBullets = uniqueValues(
        (payload.optimizedBulletPoints || []).map((bullet) => {
            const actionLine = startWithActionVerb(bullet);
            if (/\b\d+(?:\.\d+)?%|\$\d[\d,.]*|\b\d+\+?\b/.test(actionLine)) {
                return actionLine;
            }

            return `${actionLine}, improving measurable outcomes (e.g., cycle time, quality, conversion, or cost).`;
        }),
    ).slice(0, 6);

    const summaryTerms = requiredTerms.slice(0, 4).join(', ');
    const upgradedSummary = [
        payload.professionalSummary,
        summaryTerms ? `Core ATS-aligned capabilities include ${summaryTerms}.` : '',
        targetRole ? `This draft is intentionally tailored for ${targetRole} responsibilities and recruiter screening patterns.` : '',
    ].filter(Boolean).join(' ');

    return {
        ...payload,
        professionalSummary: upgradedSummary,
        optimizedSkills: mergedSkills,
        optimizedBulletPoints: rewrittenBullets,
        optimizationNotes: uniqueValues([
            ...(payload.optimizationNotes || []),
            'Prioritize quantified outcomes in every recent role bullet to improve ATS and recruiter confidence.',
            'Keep section titles standard (Summary, Skills, Experience, Projects, Education) for parser compatibility.',
        ]).slice(0, 6),
    };
};

const generateResumeSuggestions = async ({ resumeText, jobDescription, analysis }) => {
    const fallback = buildHeuristicSuggestions({ resumeText, jobDescription, analysis });

    if (!process.env.OPENAI_API_KEY) {
        return fallback;
    }

    try {
        const response = await fetch('https://api.openai.com/v1/responses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
                input: [
                    {
                        role: 'system',
                        content: 'You are an expert resume strategist. Return concise JSON only. Suggest improvements that are honest, ATS-aware, and job-specific.',
                    },
                    {
                        role: 'user',
                        content: [
                            'Compare this resume to the job description.',
                            '',
                            'Resume:',
                            resumeText,
                            '',
                            'Job description:',
                            jobDescription,
                            '',
                            `Known analysis: ATS ${analysis?.atsScore || 0}, skills ${analysis?.skillMatchPercentage || 0}, quality ${analysis?.resumeQualityScore || 0}.`,
                            `Missing skills: ${(analysis?.missingSkills || []).join(', ') || 'None detected'}.`,
                        ].join('\n'),
                    },
                ],
                text: {
                    format: {
                        type: 'json_schema',
                        name: 'resume_feedback',
                        strict: true,
                        schema: RESPONSE_SCHEMA,
                    },
                },
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenAI request failed with status ${response.status}`);
        }

        const payload = await response.json();
        const outputText = extractOutputText(payload);

        if (!outputText) {
            throw new Error('OpenAI response did not contain structured text output.');
        }

        const parsed = JSON.parse(outputText);

        return {
            provider: 'openai',
            summary: parsed.summary,
            suggestedImprovements: parsed.suggestedImprovements || fallback.suggestedImprovements,
            missingSkills: parsed.missingSkills || fallback.missingSkills,
            rewrittenBulletPoints: parsed.rewrittenBulletPoints || fallback.rewrittenBulletPoints,
        };
    } catch (error) {
        return {
            ...fallback,
            provider: 'heuristic',
            fallbackReason: error.message,
        };
    }
};

const optimizeResumeForRole = async ({
    resumeText,
    jobDescription,
    targetRole,
    companyName,
    analysis,
}) => {
    const fallback = buildHeuristicResumeOptimization({
        resumeText,
        jobDescription,
        targetRole,
        companyName,
        analysis,
    });

    if (!process.env.OPENAI_API_KEY) {
        return strengthenOptimizationPayload({
            payload: fallback,
            analysis,
            targetRole,
        });
    }

    try {
        const response = await fetch('https://api.openai.com/v1/responses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
                input: [
                    {
                        role: 'system',
                        content: 'You are an expert resume strategist. Return concise JSON only. Create ATS-friendly, honest resume optimizations tailored to the target role.',
                    },
                    {
                        role: 'user',
                        content: [
                            `Target role: ${targetRole || 'Current job role'}`,
                            companyName ? `Company: ${companyName}` : '',
                            '',
                            'Resume:',
                            resumeText,
                            '',
                            'Job description:',
                            jobDescription,
                            '',
                            `Known analysis: ATS ${analysis?.atsScore || 0}, skills ${analysis?.skillMatchPercentage || 0}, quality ${analysis?.resumeQualityScore || 0}.`,
                            `Matched skills: ${(analysis?.matchedSkills || []).join(', ') || 'None detected'}.`,
                            `Missing skills: ${(analysis?.missingSkills || []).join(', ') || 'None detected'}.`,
                            `Missing keywords: ${(analysis?.missingKeywords || []).join(', ') || 'None detected'}.`,
                            'CRITICAL INSTRUCTION: To maximize the ATS score, you MUST ruthlessly integrate as many of the "Missing skills" and "Missing keywords" as possible into the optimizedHeadline, professionalSummary, optimizedSkills, and optimizedBulletPoints. Do not hallucinate false experience, but find creative, plausible ways to weave these exact keywords and skills into the text.',
                            'Create a role-targeted headline, a short professional summary, a prioritized skills list, rewritten resume bullets, and tactical notes for weaving keywords into the resume.',
                        ].filter(Boolean).join('\n'),
                    },
                ],
                text: {
                    format: {
                        type: 'json_schema',
                        name: 'resume_optimizer',
                        strict: true,
                        schema: OPTIMIZATION_SCHEMA,
                    },
                },
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenAI request failed with status ${response.status}`);
        }

        const payload = await response.json();
        const outputText = extractOutputText(payload);

        if (!outputText) {
            throw new Error('OpenAI response did not contain structured text output.');
        }

        const parsed = JSON.parse(outputText);

        const optimized = {
            provider: 'openai',
            targetRole: targetRole || fallback.targetRole,
            optimizedHeadline: parsed.optimizedHeadline || fallback.optimizedHeadline,
            professionalSummary: parsed.professionalSummary || fallback.professionalSummary,
            optimizedSkills: parsed.optimizedSkills || fallback.optimizedSkills,
            optimizedBulletPoints: parsed.optimizedBulletPoints || fallback.optimizedBulletPoints,
            keywordIncorporationTips: parsed.keywordIncorporationTips || fallback.keywordIncorporationTips,
            optimizationNotes: parsed.optimizationNotes || fallback.optimizationNotes,
        };

        return strengthenOptimizationPayload({
            payload: optimized,
            analysis,
            targetRole,
        });
    } catch (error) {
        const heuristic = {
            ...fallback,
            provider: 'heuristic',
            fallbackReason: error.message,
        };

        return strengthenOptimizationPayload({
            payload: heuristic,
            analysis,
            targetRole,
        });
    }
};

module.exports = {
    generateResumeSuggestions,
    optimizeResumeForRole,
};
