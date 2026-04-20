import { useEffect, useMemo, useState } from 'react';
import {
    ArrowRight,
    BrainCircuit,
    Briefcase,
    Check,
    CheckCircle2,
    ClipboardCopy,
    Download,
    FileUp,
    Gauge,
    Lightbulb,
    Link2,
    Loader2,
    Save,
    Sparkles,
    Target,
    Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
});

/* ─── Circular Gauge ─── */
const CircularGauge = ({ value = 0, label, sublabel, color = '#818cf8', size = 120 }) => {
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (Math.min(value, 100) / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-2">
            <svg width={size} height={size} className="drop-shadow-lg">
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none" stroke="var(--border-color)" strokeWidth={strokeWidth}
                    opacity="0.3"
                />
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none" stroke={color} strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
                />
                <text x="50%" y="46%" dominantBaseline="middle" textAnchor="middle"
                    fill="var(--text-heading)" fontSize="1.6rem" fontWeight="800" fontFamily="var(--font-display, inherit)">
                    {value}%
                </text>
                <text x="50%" y="64%" dominantBaseline="middle" textAnchor="middle"
                    fill="var(--text-secondary)" fontSize="0.65rem" fontWeight="500">
                    {label}
                </text>
            </svg>
            <p className="text-xs text-theme-secondary text-center max-w-[140px]">{sublabel}</p>
        </div>
    );
};

/* ─── Skeleton Loader ─── */
const Skeleton = ({ className = '', style = {} }) => (
    <div
        className={`rounded-2xl animate-pulse ${className}`}
        style={{ backgroundColor: 'var(--border-color)', opacity: 0.4, ...style }}
    />
);

const SkeletonCard = () => (
    <div className="glass-card rounded-3xl p-6 space-y-4">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
    </div>
);

/* ─── Step Progress Indicator ─── */
const StepIndicator = ({ currentStep }) => {
    const steps = [
        { label: 'Parsing resume', icon: FileUp },
        { label: 'Analyzing match', icon: Target },
        { label: 'Generating insights', icon: Sparkles },
    ];

    return (
        <div className="glass-card rounded-3xl p-5">
            <div className="flex items-center justify-between gap-2">
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = index === currentStep;
                    const isDone = index < currentStep;

                    return (
                        <div key={step.label} className="flex items-center gap-2 flex-1">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500
                                ${isDone ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                                    : isActive ? 'bg-primary-500/20 border border-primary-500/40 text-primary-300 animate-pulse'
                                        : 'border text-theme-secondary'}`}
                                style={!isDone && !isActive ? { borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-input)' } : undefined}
                            >
                                {isDone ? <Check className="w-4 h-4" /> : isActive ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
                            </div>
                            <span className={`text-xs font-semibold hidden sm:block ${isDone ? 'text-emerald-400' : isActive ? 'text-primary-300' : 'text-theme-secondary'}`}>
                                {step.label}
                            </span>
                            {index < steps.length - 1 && (
                                <div className={`flex-1 h-px mx-2 transition-colors duration-500 ${isDone ? 'bg-emerald-500/40' : 'bg-[var(--border-color)]'}`} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/* ─── Copy Button ─── */
const CopyButton = ({ text }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            toast.success('Copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Failed to copy');
        }
    };

    return (
        <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-primary-500/10 transition-colors text-theme-secondary hover:text-primary-300"
            title="Copy to clipboard"
        >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <ClipboardCopy className="w-3.5 h-3.5" />}
        </button>
    );
};

/* ─── Provider Badge ─── */
const ProviderBadge = ({ provider }) => {
    const isAI = provider === 'openai';

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold
            ${isAI
                ? 'bg-gradient-to-r from-violet-500/20 to-primary-500/20 border border-violet-500/30 text-violet-300'
                : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
            }`}
        >
            {isAI ? <Zap className="w-3 h-3" /> : <BrainCircuit className="w-3 h-3" />}
            {isAI ? 'AI-Powered' : 'Heuristic'}
        </span>
    );
};

/* ─── Insight List ─── */
const InsightList = ({ title, items, emptyState }) => (
    <div className="glass-card rounded-3xl p-6">
        <h3 className="text-lg font-display font-bold text-theme-heading">{title}</h3>
        {items?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
                {items.map((item) => (
                    <span key={item} className="px-3 py-2 rounded-full text-sm border text-theme-primary" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                        {item}
                    </span>
                ))}
            </div>
        ) : (
            <p className="text-sm text-theme-secondary mt-4">{emptyState}</p>
        )}
    </div>
);

const cleanRoleLabel = (value = '') => {
    let output = value
        .replace(/\s*[|/-]\s*(linkedin|indeed|glassdoor|naukri|monster|ziprecruiter|lever|greenhouse)\b.*$/i, '')
        .replace(/\s+/g, ' ')
        .trim();

    const linkedInHiringMatch = output.match(/^(.+?)\s+(?:is\s+)?hiring\s+(.+?)\s+in\s+.+$/i);
    if (linkedInHiringMatch) {
        return linkedInHiringMatch[2].trim();
    }

    const hiringMatch = output.match(/^(.+?)\s+(?:is\s+)?hiring\s+(.+)$/i);
    if (hiringMatch) {
        return hiringMatch[2].trim();
    }

    const atCompanyMatch = output.match(/^(.+?)\s+at\s+.+$/i);
    if (atCompanyMatch) {
        output = atCompanyMatch[1].trim();
    }

    return output;
};

const buildFallbackOptimization = ({ analysis, suggestions, jobForm }) => {
    const normalizedRole = cleanRoleLabel(jobForm.role);
    const prioritizedSkills = Array.from(new Set([
        ...(analysis?.matchedSkills || []),
        ...(analysis?.missingSkills || []),
    ])).slice(0, 8);
    const rewrittenBulletPoints = suggestions?.rewrittenBulletPoints?.length
        ? suggestions.rewrittenBulletPoints
        : [
            `Position your recent work around ${normalizedRole} outcomes and pull the strongest metrics into the first two bullets.`,
            `Mirror the job description language for ${prioritizedSkills.slice(0, 2).join(' and ') || 'the top requested skills'} where it is truthful.`,
        ];
    const keywordIncorporationTips = Array.from(new Set([
        ...(analysis?.focusAreas || []),
        'Move the most important keywords into the summary, skills section, and first bullet under your latest role.',
        'Keep every added keyword tied to real ownership, tools, or measurable outcomes.',
    ])).slice(0, 6);

    return {
        provider: 'heuristic',
        targetRole: normalizedRole,
        optimizedHeadline: `${normalizedRole}${prioritizedSkills.length ? ` | ${prioritizedSkills.slice(0, 3).join(', ')}` : ''}`,
        professionalSummary: `${normalizedRole} profile tailored for ${jobForm.company || 'this opportunity'}, highlighting ${prioritizedSkills.slice(0, 3).join(', ') || 'relevant domain strengths'} and measurable outcomes that align with the posted job description.`,
        optimizedSkills: prioritizedSkills,
        optimizedBulletPoints: rewrittenBulletPoints,
        keywordIncorporationTips,
        optimizationNotes: [
            `Keep the title "${normalizedRole}" near the top of the resume to reinforce fit.`,
            'Use the optimized bullets as a draft, then edit them to stay fully truthful to your background.',
            'After updating the resume, run the ATS analysis again to confirm the keyword coverage improved.',
        ],
    };
};

const guessDraftName = ({ candidateName = '', fileName = '' }) => {
    if (candidateName?.trim()) {
        return candidateName.trim();
    }

    return fileName
        .replace(/\.[^.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (match) => match.toUpperCase())
        .trim() || 'Candidate Name';
};

const buildClientResumeDraft = ({ optimization, candidateName, fileName }) => {
    const sections = [
        {
            title: 'Professional Summary',
            variant: 'paragraphs',
            items: [optimization.professionalSummary].filter(Boolean),
        },
        {
            title: 'Core Skills',
            variant: 'bullets',
            items: optimization.optimizedSkills || [],
        },
        {
            title: 'Targeted Experience Highlights',
            variant: 'bullets',
            items: optimization.optimizedBulletPoints || [],
        },
    ];

    return {
        name: guessDraftName({ candidateName, fileName }),
        headline: optimization.optimizedHeadline || 'Optimized Resume',
        contactLine: '',
        sections,
        plainText: [
            guessDraftName({ candidateName, fileName }),
            optimization.optimizedHeadline || 'Optimized Resume',
            '',
            ...sections.flatMap((section) => [
                section.title.toUpperCase(),
                ...section.items.map((item) => (section.variant === 'bullets' ? `• ${item}` : item)),
                '',
            ]),
            'OPTIMIZATION NOTES',
            ...(optimization.optimizationNotes || []).map((note) => `• ${note}`),
        ].filter(Boolean).join('\n'),
        suggestedFileName: `${(guessDraftName({ candidateName, fileName }) || 'optimized-resume')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') || 'optimized-resume'}.doc`,
    };
};

const escapeHtml = (value = '') =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

const buildResumeDownloadHtml = (draft) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(draft.name)}</title>
    <style>
      body { font-family: "Calibri", "Segoe UI", Arial, sans-serif; color: #111827; margin: 26px 30px; line-height: 1.42; font-size: 11pt; }
      h1 { margin: 0; font-size: 24pt; letter-spacing: 0.2px; text-align: left; }
      h3 { margin: 14px 0 7px; font-size: 10pt; letter-spacing: 0.6px; text-transform: uppercase; color: #1f2937; border-bottom: 1px solid #d1d5db; padding-bottom: 3px; }
      p { margin: 0 0 8px; }
      ul { margin: 0; padding-left: 18px; }
      li { margin: 0 0 5px; }
      .headline { margin-top: 4px; font-size: 12.5pt; font-weight: 700; color: #111827; }
      .contact { margin-top: 6px; color: #374151; font-size: 10.5pt; }
      .divider { margin: 12px 0 10px; border-top: 1.5px solid #111827; }
      .section { margin-top: 2px; }
      .layout-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
      .layout-table td { vertical-align: top; padding: 0 10px 0 0; }
      .left-col { width: 62%; }
      .right-col { width: 38%; }
      .skills-list { margin: 0; padding-left: 16px; }
    </style>
  </head>
  <body>
    <h1>${escapeHtml(draft.name || 'Candidate Name')}</h1>
    <p class="headline">${escapeHtml(draft.headline || 'Optimized Resume')}</p>
    ${draft.contactLine ? `<p class="contact">${escapeHtml(draft.contactLine)}</p>` : ''}
    <div class="divider"></div>
    <table class="layout-table" role="presentation">
      <tr>
        <td class="left-col">
          ${draft.sections
              .filter((section) => !/skills|keyword coverage/i.test(section.title))
              .map((section) => `
                <div class="section">
                  <h3>${escapeHtml(section.title)}</h3>
                  ${section.variant === 'bullets'
                      ? `<ul>${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
                      : section.items.map((item) => `<p>${escapeHtml(item)}</p>`).join('')
                  }
                </div>
              `).join('')}
        </td>
        <td class="right-col">
          ${draft.sections
              .filter((section) => /skills|keyword coverage/i.test(section.title))
              .map((section) => `
                <div class="section">
                  <h3>${escapeHtml(section.title)}</h3>
                  <ul class="skills-list">${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
                </div>
              `).join('')}
        </td>
      </tr>
    </table>
  </body>
</html>
`;

/* ─── Main Copilot Component ─── */
export const Copilot = () => {
    const { user } = useAuth();
    const [jobForm, setJobForm] = useState({
        company: '',
        role: '',
        jobUrl: '',
        jobDescription: '',
        followUpDays: 5,
        reminderEnabled: true,
        emailNotifications: false,
    });
    const [resumeFileName, setResumeFileName] = useState('');
    const [resumeFileData, setResumeFileData] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [suggestions, setSuggestions] = useState(null);
    const [optimizedResume, setOptimizedResume] = useState(null);
    const [extracting, setExtracting] = useState(false);
    const [running, setRunning] = useState(false);
    const [optimizing, setOptimizing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [refreshingPrediction, setRefreshingPrediction] = useState(false);
    const [runStep, setRunStep] = useState(-1); // -1 = not started, 0/1/2 = step index

    const canRun = useMemo(
        () => Boolean(resumeFileData && jobForm.jobDescription.trim()),
        [resumeFileData, jobForm.jobDescription],
    );
    const canOptimize = useMemo(
        () => Boolean(resumeFileData && jobForm.jobDescription.trim() && jobForm.role.trim()),
        [resumeFileData, jobForm.jobDescription, jobForm.role],
    );

    useEffect(() => {
        setOptimizedResume(null);
    }, [jobForm.role, jobForm.jobDescription, resumeFileName]);

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        if (file.type !== 'application/pdf') {
            toast.error('Please upload a PDF resume');
            return;
        }

        try {
            const dataUrl = await fileToDataUrl(file);
            setResumeFileName(file.name);
            setResumeFileData(dataUrl);
            toast.success('Resume attached');
        } catch {
            toast.error('Failed to read the selected file');
        }
    };

    const handleExtractJob = async () => {
        if (!jobForm.jobUrl.trim()) {
            toast.error('Paste a job URL first');
            return;
        }

        setExtracting(true);

        try {
            const response = await api.post('/extract-job', { url: jobForm.jobUrl.trim() });
            setJobForm((current) => ({
                ...current,
                company: response.data.companyName || current.company,
                role: response.data.jobTitle || current.role,
                jobDescription: response.data.jobDescription || current.jobDescription,
            }));
            toast.success('Job details extracted');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unable to extract that listing');
        } finally {
            setExtracting(false);
        }
    };

    const handleRunCopilot = async () => {
        if (!canRun) {
            toast.error('Upload a PDF and add a job description first');
            return;
        }

        setRunning(true);
        setRunStep(0);

        try {
            // Step 1: Analyze resume
            setRunStep(0);
            const analyzeResponse = await api.post('/analyze-resume', {
                resumeFileData,
                fileName: resumeFileName,
                jobDescription: jobForm.jobDescription,
            });

            const analysisPayload = analyzeResponse.data;
            setAnalysis(analysisPayload);

            // Step 2: Generate suggestions
            setRunStep(1);
            await new Promise((r) => setTimeout(r, 300)); // brief pause for visual feedback

            setRunStep(2);
            const suggestionResponse = await api.post('/generate-suggestions', {
                resumeText: analysisPayload.resumeText,
                jobDescription: jobForm.jobDescription,
            });

            setSuggestions(suggestionResponse.data);
            setRunStep(3); // all done
            toast.success('Copilot analysis complete');
        } catch (error) {
            toast.error(error.response?.data?.message || 'The copilot run failed');
        } finally {
            setRunning(false);
            setTimeout(() => setRunStep(-1), 3000);
        }
    };

    const handleRefreshPrediction = async () => {
        if (!analysis) {
            return;
        }

        setRefreshingPrediction(true);

        try {
            const response = await api.post('/predict-interview', {
                atsScore: analysis.atsScore,
                skillMatchPercentage: analysis.skillMatchPercentage,
                resumeQualityScore: analysis.resumeQualityScore,
                missingSkillsCount: analysis.missingSkills?.length || 0,
            });

            setAnalysis((current) => ({
                ...current,
                interviewProbability: response.data.interviewProbability,
                outlook: response.data.outlook,
                drivers: response.data.drivers,
            }));
            toast.success('Interview probability refreshed');
        } catch {
            toast.error('Failed to refresh interview probability');
        } finally {
            setRefreshingPrediction(false);
        }
    };

    const handleOptimizeResume = async () => {
        if (!canOptimize) {
            toast.error('Upload a PDF, add the job description, and provide the target role first');
            return;
        }

        setOptimizing(true);

        try {
            const response = await api.post('/optimize-resume', {
                resumeFileData,
                fileName: resumeFileName,
                jobDescription: jobForm.jobDescription,
                targetRole: jobForm.role,
                companyName: jobForm.company,
                candidateName: user?.name,
            });

            if (response.data.analysis) {
                setAnalysis(response.data.analysis);
            }

            const optimizationPayload = {
                provider: response.data.provider,
                targetRole: response.data.targetRole,
                optimizedHeadline: response.data.optimizedHeadline,
                professionalSummary: response.data.professionalSummary,
                optimizedSkills: response.data.optimizedSkills || [],
                optimizedBulletPoints: response.data.optimizedBulletPoints || [],
                keywordIncorporationTips: response.data.keywordIncorporationTips || [],
                optimizationNotes: response.data.optimizationNotes || [],
                atsGapChecklist: response.data.atsGapChecklist || [],
                atsTargetBand: response.data.atsTargetBand || null,
            };

            setOptimizedResume({
                ...optimizationPayload,
                resumeDraft: response.data.resumeDraft || buildClientResumeDraft({
                    optimization: optimizationPayload,
                    candidateName: user?.name,
                    fileName: resumeFileName,
                }),
            });

            toast.success('Resume optimized for the current role');
        } catch (error) {
            if (error.response?.status === 404) {
                try {
                    const analyzeResponse = await api.post('/analyze-resume', {
                        resumeFileData,
                        fileName: resumeFileName,
                        jobDescription: jobForm.jobDescription,
                    });
                    const analysisPayload = analyzeResponse.data;
                    setAnalysis(analysisPayload);

                    const suggestionResponse = await api.post('/generate-suggestions', {
                        resumeText: analysisPayload.resumeText,
                        jobDescription: jobForm.jobDescription,
                    });
                    const suggestionPayload = suggestionResponse.data;
                    setSuggestions(suggestionPayload);

                    const fallbackOptimization = buildFallbackOptimization({
                        analysis: analysisPayload,
                        suggestions: suggestionPayload,
                        jobForm,
                    });

                    setOptimizedResume({
                        ...fallbackOptimization,
                        resumeDraft: buildClientResumeDraft({
                            optimization: fallbackOptimization,
                            candidateName: user?.name,
                            fileName: resumeFileName,
                        }),
                    });

                    toast.success('Resume optimized using fallback mode');
                    return;
                } catch (fallbackError) {
                    toast.error(fallbackError.response?.data?.message || 'Optimizer fallback failed. Restart the backend and try again.');
                    return;
                }
            }

            toast.error(error.response?.data?.message || 'Failed to optimize the resume');
        } finally {
            setOptimizing(false);
        }
    };

    const handleDownloadOptimizedResume = () => {
        if (!optimizedResume?.resumeDraft) {
            toast.error('Optimize the resume first');
            return;
        }

        const html = buildResumeDownloadHtml(optimizedResume.resumeDraft);
        const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' });
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = blobUrl;
        link.download = optimizedResume.resumeDraft.suggestedFileName || 'optimized-resume.doc';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);

        toast.success('Optimized resume downloaded');
    };

    const handleSaveApplication = async () => {
        if (!jobForm.company.trim() || !jobForm.role.trim()) {
            toast.error('Add the company and role before saving');
            return;
        }

        setSaving(true);

        try {
            const payload = {
                company: jobForm.company,
                role: jobForm.role,
                status: 'Applied',
                jobUrl: jobForm.jobUrl,
                jobDescription: jobForm.jobDescription,
                resume: {
                    fileName: resumeFileName,
                    extractedText: analysis?.resumeText,
                },
                analysis: analysis ? {
                    atsScore: analysis.atsScore,
                    keywordMatchPercentage: analysis.keywordMatchPercentage,
                    skillMatchPercentage: analysis.skillMatchPercentage,
                    resumeQualityScore: analysis.resumeQualityScore,
                    interviewProbability: analysis.interviewProbability,
                    missingKeywords: analysis.missingKeywords,
                    matchedKeywords: analysis.matchedKeywords,
                    missingSkills: analysis.missingSkills,
                    matchedSkills: analysis.matchedSkills,
                    suggestions: suggestions?.suggestedImprovements || [],
                    rewrittenBulletPoints: suggestions?.rewrittenBulletPoints || [],
                    lastAnalyzedAt: new Date().toISOString(),
                } : undefined,
                reminder: {
                    enabled: jobForm.reminderEnabled,
                    followUpDays: Number(jobForm.followUpDays) || 5,
                    emailNotifications: jobForm.emailNotifications,
                },
            };

            await api.post('/jobs', payload);
            toast.success('Application saved to tracker');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save application');
        } finally {
            setSaving(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 75) return '#34d399';   // emerald
        if (score >= 50) return '#818cf8';   // indigo
        if (score >= 30) return '#fbbf24';   // amber
        return '#f87171';                    // red
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300 text-sm font-semibold">
                        <BrainCircuit className="w-4 h-4" />
                        Resume intelligence workspace
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-display font-black text-theme-heading tracking-tight mt-4">Turn every application into a smarter submission</h2>
                    <p className="text-theme-secondary mt-2 max-w-3xl">
                        Upload a PDF resume, compare it against a live job description, surface missing keywords, generate improvement ideas, and save the finished analysis directly into your tracker.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button onClick={handleRunCopilot} disabled={!canRun || running} className="btn-primary">
                        {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {running ? 'Analyzing...' : 'Run Copilot'}
                    </button>
                    <button onClick={handleOptimizeResume} disabled={!canOptimize || optimizing} className="btn-secondary">
                        {optimizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
                        {optimizing ? 'Optimizing...' : 'Optimize Resume'}
                    </button>
                    <button onClick={handleSaveApplication} disabled={saving} className="btn-secondary">
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Application'}
                    </button>
                </div>
            </div>

            {/* Step Progress - visible during run */}
            {running && <StepIndicator currentStep={runStep} />}

            <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
                <div className="glass-card rounded-[2rem] p-6 sm:p-8 space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-primary-500/10 border border-primary-500/20 text-primary-300 flex items-center justify-center">
                                    <Link2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-display font-bold text-theme-heading">Job source</h3>
                                    <p className="text-sm text-theme-secondary">Paste a URL or fill the details manually.</p>
                                </div>
                            </div>
                            <input
                                className="input-field"
                                placeholder="https://company.com/jobs/..."
                                value={jobForm.jobUrl}
                                onChange={(event) => setJobForm((current) => ({ ...current, jobUrl: event.target.value }))}
                            />
                            <button onClick={handleExtractJob} disabled={extracting} className="btn-secondary w-full justify-center">
                                {extracting ? 'Extracting...' : 'Extract job details'}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-primary-500/10 border border-primary-500/20 text-primary-300 flex items-center justify-center">
                                    <FileUp className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-display font-bold text-theme-heading">Resume upload</h3>
                                    <p className="text-sm text-theme-secondary">PDF parsing happens on the backend for ATS analysis.</p>
                                </div>
                            </div>
                            <label className="rounded-3xl border-2 border-dashed p-6 block cursor-pointer hover:border-primary-400/60 transition-colors" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-input)' }}>
                                <input type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
                                <p className="font-semibold text-theme-heading">Choose a PDF resume</p>
                                <p className="text-sm text-theme-secondary mt-2">{resumeFileName || 'No file selected yet'}</p>
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-theme-secondary mb-2">Company</label>
                            <input className="input-field" value={jobForm.company} onChange={(event) => setJobForm((current) => ({ ...current, company: event.target.value }))} placeholder="e.g. Stripe" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-theme-secondary mb-2">Role</label>
                            <input className="input-field" value={jobForm.role} onChange={(event) => setJobForm((current) => ({ ...current, role: event.target.value }))} placeholder="e.g. Product Engineer" />
                            <p className="text-xs text-theme-secondary mt-2">This current job role is used by the resume optimizer when tailoring the draft.</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-theme-secondary mb-2">Job description</label>
                        <textarea
                            className="input-field min-h-[220px]"
                            placeholder="Paste the full job description here if the extractor misses anything."
                            value={jobForm.jobDescription}
                            onChange={(event) => setJobForm((current) => ({ ...current, jobDescription: event.target.value }))}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="rounded-2xl border px-4 py-4 flex items-center justify-between gap-4" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                            <div>
                                <p className="font-semibold text-theme-heading">Enable reminder</p>
                                <p className="text-sm text-theme-secondary mt-1">Queue a follow-up for this application.</p>
                            </div>
                            <input type="checkbox" checked={jobForm.reminderEnabled} onChange={(event) => setJobForm((current) => ({ ...current, reminderEnabled: event.target.checked }))} className="w-5 h-5" />
                        </label>
                        <div className="rounded-2xl border px-4 py-4" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                            <label className="block text-sm font-semibold text-theme-secondary mb-2">Follow-up days</label>
                            <input type="number" min="1" max="90" className="input-field" value={jobForm.followUpDays} onChange={(event) => setJobForm((current) => ({ ...current, followUpDays: event.target.value }))} />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Score Gauges */}
                    {running && !analysis ? (
                        <div className="glass-card rounded-3xl p-8">
                            <div className="flex justify-around">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex flex-col items-center gap-3">
                                        <Skeleton className="rounded-full" style={{ width: 120, height: 120 }} />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="glass-card rounded-3xl p-6 sm:p-8">
                            <div className="flex flex-wrap justify-around gap-6">
                                <CircularGauge
                                    value={analysis?.atsScore ?? 0}
                                    label="ATS Match"
                                    sublabel="Weighted from keyword, skill, and quality alignment."
                                    color={getScoreColor(analysis?.atsScore ?? 0)}
                                />
                                <CircularGauge
                                    value={analysis?.skillMatchPercentage ?? 0}
                                    label="Skill Match"
                                    sublabel="How much of the role's skill stack your resume covers."
                                    color={getScoreColor(analysis?.skillMatchPercentage ?? 0)}
                                />
                                <CircularGauge
                                    value={analysis?.interviewProbability ?? 0}
                                    label="Interview Odds"
                                    sublabel={analysis?.outlook || 'Run the copilot to estimate shortlist potential.'}
                                    color={getScoreColor(analysis?.interviewProbability ?? 0)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Interview Predictor */}
                    {running && !analysis ? (
                        <SkeletonCard />
                    ) : (
                        <div className="glass-card rounded-[2rem] p-6 space-y-5">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-display font-bold text-theme-heading">Interview predictor</h3>
                                    <p className="text-sm text-theme-secondary mt-1">A quick probability signal based on the latest analysis inputs.</p>
                                </div>
                                <button onClick={handleRefreshPrediction} disabled={!analysis || refreshingPrediction} className="btn-secondary">
                                    {refreshingPrediction ? 'Refreshing...' : 'Refresh'}
                                </button>
                            </div>
                            <div className="h-3 rounded-full bg-slate-800/60 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-primary-400 to-accent-500"
                                    style={{
                                        width: `${Math.max(4, analysis?.interviewProbability || 0)}%`,
                                        transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                                    }}
                                />
                            </div>
                            <div className="space-y-3">
                                {(analysis?.drivers || ['Run an analysis to see what is helping or hurting the shortlist probability.']).map((driver) => (
                                    <div key={driver} className="rounded-2xl border px-4 py-3 text-sm text-theme-secondary" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                                        {driver}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Missing Keywords */}
                    {running && !analysis ? (
                        <SkeletonCard />
                    ) : (
                        <InsightList
                            title="Missing keywords"
                            items={analysis?.missingKeywords}
                            emptyState="No missing keywords yet. Upload a resume and run the copilot to see what the job description expects."
                        />
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {running && !suggestions ? (
                    <>
                        <SkeletonCard />
                        <SkeletonCard />
                    </>
                ) : (
                    <>
                        <InsightList
                            title="Missing skills"
                            items={suggestions?.missingSkills || analysis?.missingSkills}
                            emptyState="Your missing skills list will appear here after analysis."
                        />

                        <div className="glass-card rounded-3xl p-6">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-primary-500/10 border border-primary-500/20 text-primary-300 flex items-center justify-center">
                                        <Lightbulb className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-display font-bold text-theme-heading">Improvement suggestions</h3>
                                        <p className="text-sm text-theme-secondary mt-1">
                                            {suggestions?.provider === 'openai'
                                                ? 'Generated with OpenAI-powered structured feedback.'
                                                : 'Fallback heuristic guidance when AI output is unavailable.'}
                                        </p>
                                    </div>
                                </div>
                                {suggestions?.provider && <ProviderBadge provider={suggestions.provider} />}
                            </div>

                            <p className="text-theme-secondary text-sm mt-5">{suggestions?.summary || 'Run the copilot to generate tailored suggestions.'}</p>

                            <div className="mt-5 space-y-3">
                                {(suggestions?.suggestedImprovements || []).map((suggestion) => (
                                    <div key={suggestion} className="rounded-2xl border px-4 py-3 text-sm text-theme-primary" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                                        {suggestion}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {optimizing && !optimizedResume ? (
                <SkeletonCard />
            ) : (
                <div className="glass-card rounded-[2rem] p-6 sm:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-primary-500/10 border border-primary-500/20 text-primary-300 flex items-center justify-center">
                                    <Target className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-display font-bold text-theme-heading">Resume optimizer</h3>
                                    <p className="text-sm text-theme-secondary mt-1">
                                        Tailor the resume draft to the current role and job description on this page.
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-theme-secondary mt-4">
                                {optimizedResume?.targetRole
                                    ? `Optimized for ${optimizedResume.targetRole}${jobForm.company ? ` at ${jobForm.company}` : ''}.`
                                    : 'Use the current role field above, then generate a role-targeted resume draft.'}
                            </p>
                            {optimizedResume?.atsTargetBand ? (
                                <p className="text-xs mt-2 text-theme-secondary">
                                    ATS target band: {optimizedResume.atsTargetBand.min}-{optimizedResume.atsTargetBand.max}% (current: {optimizedResume.atsTargetBand.achieved}%)
                                </p>
                            ) : null}
                        </div>
                        <div className="flex flex-wrap gap-3 items-center">
                            {optimizedResume?.provider ? <ProviderBadge provider={optimizedResume.provider} /> : null}
                            {optimizedResume?.resumeDraft ? (
                                <button onClick={handleDownloadOptimizedResume} className="btn-primary">
                                    <Download className="w-4 h-4" />
                                    Download Resume
                                </button>
                            ) : null}
                        </div>
                    </div>

                    {optimizedResume ? (
                        <div className="mt-6 space-y-6">
                            <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
                                <div className="rounded-3xl border p-5" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-theme-secondary">Optimized headline</p>
                                            <h4 className="text-2xl font-display font-bold text-theme-heading mt-3">{optimizedResume.optimizedHeadline}</h4>
                                        </div>
                                        <CopyButton text={optimizedResume.optimizedHeadline} />
                                    </div>

                                    <div className="mt-6 flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-theme-secondary">Professional summary</p>
                                            <p className="text-sm text-theme-primary leading-relaxed mt-3">{optimizedResume.professionalSummary}</p>
                                        </div>
                                        <CopyButton text={optimizedResume.professionalSummary} />
                                    </div>
                                </div>

                                <div className="rounded-3xl border p-5" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-theme-secondary">Prioritized skills</p>
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {optimizedResume.optimizedSkills.map((skill) => (
                                                    <span key={skill} className="px-3 py-2 rounded-full text-sm border text-theme-primary" style={{ borderColor: 'var(--border-color)' }}>
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <CopyButton text={optimizedResume.optimizedSkills.join(', ')} />
                                    </div>
                                </div>
                            </div>

                            {optimizedResume.resumeDraft ? (
                                <div className="rounded-3xl border p-6" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <h4 className="text-lg font-display font-bold text-theme-heading">Optimized resume draft</h4>
                                            <p className="text-sm text-theme-secondary mt-1">This is the rewritten resume version that will be downloaded.</p>
                                        </div>
                                        <CopyButton text={optimizedResume.resumeDraft.plainText} />
                                    </div>

                                    <div className="mt-6 rounded-3xl border p-6 sm:p-8" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                                        <div className="border-b pb-5" style={{ borderColor: 'var(--border-color)' }}>
                                            <h5 className="text-3xl font-display font-black theme-text-heading">{optimizedResume.resumeDraft.name}</h5>
                                            <p className="text-base font-semibold mt-2 theme-text-heading">{optimizedResume.resumeDraft.headline}</p>
                                            {optimizedResume.resumeDraft.contactLine ? (
                                                <p className="text-sm theme-text-secondary mt-2">{optimizedResume.resumeDraft.contactLine}</p>
                                            ) : null}
                                        </div>

                                        <div className="mt-6 space-y-6">
                                            {optimizedResume.resumeDraft.sections.map((section) => (
                                                <div key={section.title}>
                                                    <p className="text-xs font-bold uppercase tracking-[0.18em] theme-text-secondary mb-3">{section.title}</p>
                                                    {section.variant === 'bullets' ? (
                                                        <ul className="space-y-2 list-disc pl-5 text-sm leading-relaxed text-theme-primary">
                                                            {section.items.map((item) => (
                                                                <li key={item}>{item}</li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <div className="space-y-2 text-sm leading-relaxed text-theme-primary">
                                                            {section.items.map((item) => (
                                                                <p key={item}>{item}</p>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <h4 className="text-lg font-display font-bold text-theme-heading">Optimized bullet points</h4>
                                        <CopyButton text={optimizedResume.optimizedBulletPoints.join('\n')} />
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        {optimizedResume.optimizedBulletPoints.map((bullet) => (
                                            <div key={bullet} className="rounded-3xl border p-5 text-sm leading-relaxed text-theme-primary" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                                                {bullet}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {optimizedResume.atsGapChecklist?.length ? (
                                        <div className="rounded-3xl border p-5" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                                            <div className="flex items-center justify-between gap-3">
                                                <h4 className="text-lg font-display font-bold text-theme-heading">Why ATS is not 82+ yet</h4>
                                                <CopyButton text={optimizedResume.atsGapChecklist.join('\n')} />
                                            </div>
                                            <div className="mt-4 space-y-3">
                                                {optimizedResume.atsGapChecklist.map((item) => (
                                                    <div key={item} className="rounded-2xl border px-4 py-3 text-sm text-theme-secondary" style={{ borderColor: 'var(--border-color)' }}>
                                                        {item}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : null}

                                    <div className="rounded-3xl border p-5" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                                        <div className="flex items-center justify-between gap-3">
                                            <h4 className="text-lg font-display font-bold text-theme-heading">Keyword incorporation tips</h4>
                                            <CopyButton text={optimizedResume.keywordIncorporationTips.join('\n')} />
                                        </div>
                                        <div className="mt-4 space-y-3">
                                            {optimizedResume.keywordIncorporationTips.map((tip) => (
                                                <div key={tip} className="rounded-2xl border px-4 py-3 text-sm text-theme-secondary" style={{ borderColor: 'var(--border-color)' }}>
                                                    {tip}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="rounded-3xl border p-5" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                                        <div className="flex items-center justify-between gap-3">
                                            <h4 className="text-lg font-display font-bold text-theme-heading">Optimization notes</h4>
                                            <CopyButton text={optimizedResume.optimizationNotes.join('\n')} />
                                        </div>
                                        <div className="mt-4 space-y-3">
                                            {optimizedResume.optimizationNotes.map((note) => (
                                                <div key={note} className="rounded-2xl border px-4 py-3 text-sm text-theme-secondary" style={{ borderColor: 'var(--border-color)' }}>
                                                    {note}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-6 rounded-3xl border p-5 text-sm text-theme-secondary" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                            The optimizer will use your uploaded PDF resume, the pasted job description, and the current job role to draft a sharper headline, summary, skills section, and bullet points.
                        </div>
                    )}
                </div>
            )}

            {/* Rewritten Bullet Points with Copy */}
            {running && !suggestions ? (
                <SkeletonCard />
            ) : (
                <div className="glass-card rounded-[2rem] p-6 sm:p-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-primary-500/10 border border-primary-500/20 text-primary-300 flex items-center justify-center">
                            <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-display font-bold text-theme-heading">Rewritten bullet ideas</h3>
                            <p className="text-sm text-theme-secondary mt-1">Use these as editing prompts, then adjust them to stay truthful to your experience.</p>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-4">
                        {(suggestions?.rewrittenBulletPoints || []).length ? (
                            suggestions.rewrittenBulletPoints.map((bullet) => (
                                <div key={bullet} className="rounded-3xl border p-5 text-sm leading-relaxed text-theme-primary relative group" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <CopyButton text={bullet} />
                                    </div>
                                    {bullet}
                                </div>
                            ))
                        ) : (
                            <div className="rounded-3xl border p-5 text-sm leading-relaxed text-theme-secondary xl:col-span-3" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                                Once the analysis is complete, rewritten bullet examples will appear here.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
