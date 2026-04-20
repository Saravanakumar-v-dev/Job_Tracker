const {
    normalizeText,
    sanitizeCompanyName,
    sanitizeRoleTitle,
    extractBulletLines,
    uniqueValues,
} = require('../utils/text');

const SECTION_ALIASES = {
    summary: ['summary', 'professional summary', 'profile', 'about'],
    experience: ['experience', 'work experience', 'professional experience', 'employment', 'employment history'],
    skills: ['skills', 'technical skills', 'core competencies', 'toolkit'],
    projects: ['projects', 'project experience'],
    education: ['education', 'academic background'],
    certifications: ['certifications', 'licenses', 'awards'],
};

const ATS_TARGET_MIN = 82;
const ATS_TARGET_MAX = 90;

const sanitizeFilePart = (value = '') =>
    value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 50);

const guessCandidateName = ({ resumeText = '', fallbackName = '', fileName = '' }) => {
    const lines = resumeText
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    const candidateLine = lines.find((line) => {
        if (line.length > 50) {
            return false;
        }

        if (/@|linkedin\.com|github\.com|portfolio|behance|http/i.test(line)) {
            return false;
        }

        if (/\d{3}|\+\d/.test(line)) {
            return false;
        }

        const words = line.split(/\s+/);
        return words.length >= 2 && words.length <= 5;
    });

    if (candidateLine) {
        return candidateLine;
    }

    if (fallbackName?.trim()) {
        return fallbackName.trim();
    }

    return fileName
        .replace(/\.[^.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (match) => match.toUpperCase())
        .trim() || 'Candidate Name';
};

const extractContactInfo = (resumeText = '') => {
    const email = resumeText.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i)?.[0] || '';
    const phone = resumeText.match(/(?:\+\d{1,3}[\s-]?)?(?:\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4})/)?.[0] || '';
    const links = uniqueValues(
        Array.from(resumeText.matchAll(/(?:https?:\/\/|www\.)[^\s)]+/gi)).map((match) => match[0])
    ).slice(0, 3);

    return {
        email,
        phone,
        links,
    };
};

const findSectionKey = (line = '') => {
    const normalizedLine = normalizeText(line);

    return Object.entries(SECTION_ALIASES).find(([, aliases]) =>
        aliases.includes(normalizedLine)
    )?.[0] || null;
};

const parseResumeSections = (resumeText = '') => {
    const sections = {
        header: [],
        summary: [],
        experience: [],
        skills: [],
        projects: [],
        education: [],
        certifications: [],
        other: [],
    };

    let currentSection = 'header';

    resumeText.split(/\r?\n/).forEach((line) => {
        const trimmedLine = line.trim();

        if (!trimmedLine) {
            return;
        }

        const sectionKey = findSectionKey(trimmedLine);
        if (sectionKey) {
            currentSection = sectionKey;
            return;
        }

        sections[currentSection] = sections[currentSection] || [];
        sections[currentSection].push(trimmedLine);
    });

    return sections;
};

const toBulletList = (lines = [], limit = 4) => {
    const bullets = extractBulletLines(lines.join('\n'));

    if (bullets.length) {
        return bullets.slice(0, limit);
    }

    return lines.slice(0, limit);
};

const toSentenceCase = (value = '') => {
    if (!value) {
        return value;
    }

    return value.charAt(0).toUpperCase() + value.slice(1);
};

const buildAtsCoverageKeywords = ({ optimization = {}, parsedSections = {}, analysis = {} }) => {
    const projectKeywords = uniqueValues(
        extractBulletLines((parsedSections.projects || []).join('\n'))
            .flatMap((line) => line.split(/[,/]| and /i))
            .map((term) => term.trim())
            .filter((term) => term && term.length <= 30),
    );

    return uniqueValues([
        ...(optimization.optimizedSkills || []),
        ...(analysis.missingSkills || []),
        ...(analysis.missingKeywords || []),
        ...(analysis.matchedSkills || []),
        ...projectKeywords,
    ]).slice(0, 16);
};

const buildResumeDraft = ({
    resumeText,
    optimization,
    fileName,
    candidateName,
    targetRole,
    companyName,
    analysis = {},
    enforceKeywordCoverage = false,
}) => {
    const parsedSections = parseResumeSections(resumeText);
    const name = guessCandidateName({
        resumeText,
        fallbackName: candidateName,
        fileName,
    });
    const contact = extractContactInfo(resumeText);
    const contactLine = [contact.email, contact.phone, ...contact.links].filter(Boolean).join(' | ');

    const atsCoverageKeywords = buildAtsCoverageKeywords({
        optimization,
        parsedSections,
        analysis,
    });
    const targetedRole = sanitizeRoleTitle(targetRole);
    const targetedCompany = sanitizeCompanyName(companyName);
    const keyOutcomes = toBulletList(parsedSections.experience, 3).map((line) =>
        toSentenceCase(line.replace(/^[-*•]\s*/, '').trim()));
    const roleAlignmentSnapshot = uniqueValues([
        targetedRole ? `Target role alignment: ${targetedRole}.` : '',
        targetedCompany ? `Company context tailored for ${targetedCompany}.` : '',
        `ATS focus terms integrated: ${(atsCoverageKeywords.slice(0, 6).join(', ')) || 'role-specific skills and keywords'}.`,
    ]).filter(Boolean);

    const sections = [
        {
            title: 'Professional Summary',
            variant: 'paragraphs',
            items: [optimization.professionalSummary].filter(Boolean),
        },
        {
            title: 'Role Alignment Snapshot',
            variant: 'bullets',
            items: roleAlignmentSnapshot,
        },
        {
            title: 'Core Skills',
            variant: 'bullets',
            items: (optimization.optimizedSkills || []),
        },
        {
            title: 'Targeted Experience Highlights',
            variant: 'bullets',
            items: uniqueValues([
                ...(optimization.optimizedBulletPoints || []),
                ...keyOutcomes,
            ]).slice(0, 6),
        },
    ];

    if (enforceKeywordCoverage && atsCoverageKeywords.length) {
        sections.push({
            title: 'ATS Keyword Coverage',
            variant: 'bullets',
            items: atsCoverageKeywords.map((keyword) => `Experienced with ${keyword} in production-focused delivery contexts.`),
        });
    }

    if (parsedSections.projects.length) {
        sections.push({
            title: 'Projects',
            variant: 'bullets',
            items: toBulletList(parsedSections.projects, 4),
        });
    }

    if (parsedSections.education.length) {
        sections.push({
            title: 'Education',
            variant: 'paragraphs',
            items: parsedSections.education.slice(0, 4),
        });
    }

    if (parsedSections.certifications.length) {
        sections.push({
            title: 'Certifications',
            variant: 'paragraphs',
            items: parsedSections.certifications.slice(0, 4),
        });
    }

    if (!parsedSections.projects.length && parsedSections.experience.length) {
        sections.push({
            title: 'Additional Experience Context',
            variant: 'bullets',
            items: toBulletList(parsedSections.experience, 4),
        });
    }

    const plainText = [
        name,
        optimization.optimizedHeadline || sanitizeRoleTitle(targetRole) || '',
        contactLine,
        '',
        ...sections.flatMap((section) => [
            section.title.toUpperCase(),
            ...section.items.map((item) => (section.variant === 'bullets' ? `• ${item}` : item)),
            '',
        ]),
        'OPTIMIZATION NOTES',
        ...(optimization.optimizationNotes || []).map((note) => `• ${note}`),
        '',
        `ATS target range: ${ATS_TARGET_MIN}-${ATS_TARGET_MAX}%`,
        companyName ? `Tailored for: ${sanitizeCompanyName(companyName)}` : '',
        targetRole ? `Target role: ${sanitizeRoleTitle(targetRole)}` : '',
    ].filter(Boolean).join('\n');

    const suggestedFileName = [
        sanitizeFilePart(name),
        sanitizeFilePart(sanitizeRoleTitle(targetRole) || 'optimized-resume'),
        'optimized-resume',
    ].filter(Boolean).join('-');

    return {
        name,
        headline: optimization.optimizedHeadline || targetRole || 'Optimized Resume',
        contactLine,
        sections,
        plainText,
        suggestedFileName: `${suggestedFileName || 'optimized-resume'}.doc`,
    };
};

module.exports = {
    buildResumeDraft,
};
