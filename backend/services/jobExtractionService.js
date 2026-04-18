const cheerio = require('cheerio');
const { createHttpError } = require('../utils/httpError');

const cleanText = (value = '') =>
    value
        .replace(/\s+/g, ' ')
        .replace(/\u00a0/g, ' ')
        .trim();

const readFirstMatch = ($, selectors = []) => {
    for (const selector of selectors) {
        const text = cleanText($(selector).first().text() || $(selector).first().attr('content') || '');
        if (text) {
            return text;
        }
    }

    return '';
};

const inferCompanyFromTitle = (pageTitle = '') => {
    const separators = [' - ', ' | ', ' @ ', ' at '];

    for (const separator of separators) {
        if (pageTitle.includes(separator)) {
            return cleanText(pageTitle.split(separator).slice(1).join(separator));
        }
    }

    return '';
};

const extractRichDescription = ($) => {
    $('script, style, noscript').remove();

    const candidateSelectors = [
        '[data-testid="jobDescriptionText"]',
        '[data-test="jobDescriptionText"]',
        '.jobDescriptionContent',
        '.jobsearch-JobComponent-description',
        '#jobDescriptionText',
        'article',
        'main',
    ];

    const selectorText = readFirstMatch($, candidateSelectors);
    if (selectorText.length > 200) {
        return selectorText;
    }

    let largestText = '';
    $('section, div').each((_, element) => {
        const text = cleanText($(element).text());
        if (text.length > largestText.length) {
            largestText = text;
        }
    });

    return largestText;
};

const extractJobDetails = async (targetUrl) => {
    let parsedUrl;

    try {
        parsedUrl = new URL(targetUrl);
    } catch (error) {
        throw createHttpError(400, 'Please provide a valid job URL.');
    }

    const response = await fetch(parsedUrl.toString(), {
        headers: {
            'User-Agent': 'Job-Tracker-Copilot/1.0',
            Accept: 'text/html,application/xhtml+xml',
        },
    });

    if (!response.ok) {
        throw createHttpError(response.status, `Unable to fetch the job listing. Received status ${response.status}.`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const pageTitle = cleanText($('title').text());
    const jobTitle = readFirstMatch($, [
        'meta[property="og:title"]',
        'meta[name="twitter:title"]',
        'h1',
        '[data-testid="jobsearch-JobInfoHeader-title"]',
    ]) || pageTitle;
    const companyName = readFirstMatch($, [
        '[data-testid="inlineHeader-companyName"]',
        '[data-testid="jobsearch-CompanyInfoContainer"]',
        '.jobsearch-CompanyInfoWithoutHeaderImage div',
        '.company',
        '.employer',
    ]) || inferCompanyFromTitle(pageTitle);
    const jobDescription = extractRichDescription($);

    if (!jobTitle && !jobDescription) {
        throw createHttpError(422, 'We could not extract enough content from that page. Paste the description manually instead.');
    }

    return {
        jobTitle: cleanText(jobTitle),
        companyName: cleanText(companyName),
        jobDescription: cleanText(jobDescription).slice(0, 12000),
        sourceUrl: parsedUrl.toString(),
    };
};

module.exports = {
    extractJobDetails,
};
