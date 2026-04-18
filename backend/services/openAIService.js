const { buildHeuristicSuggestions } = require('./analysisService');

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

const extractOutputText = (payload) => {
    if (typeof payload.output_text === 'string' && payload.output_text.trim()) {
        return payload.output_text;
    }

    const messageItem = payload.output?.find((item) => item.type === 'message');
    const outputText = messageItem?.content?.find((item) => item.type === 'output_text')?.text;

    return outputText || null;
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

module.exports = {
    generateResumeSuggestions,
};
