const STOPWORDS = new Set([
    'a', 'about', 'above', 'across', 'after', 'again', 'against', 'all', 'also', 'am',
    'an', 'and', 'any', 'are', 'as', 'at', 'be', 'because', 'been', 'before', 'being',
    'below', 'between', 'both', 'but', 'by', 'can', 'could', 'did', 'do', 'does', 'doing',
    'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have', 'having',
    'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in',
    'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself', 'no',
    'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours',
    'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than',
    'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they',
    'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we',
    'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'will', 'with',
    'you', 'your', 'yours', 'yourself', 'yourselves', 'experience', 'requirements', 'preferred',
    'ability', 'responsibilities', 'including', 'across', 'within', 'using', 'strong', 'working',
    'work', 'team', 'teams', 'role', 'position', 'candidate', 'applicant', 'job', 'years',
    'year', 'plus', 'must', 'need', 'needs', 'build', 'develop', 'support', 'required',
    'engineer', 'engineers', 'developer', 'developers', 'manager', 'managers', 'design',
]);

const SKILL_LIBRARY = [
    // Programming languages
    'c', 'c#', 'c++', 'dart', 'elixir', 'erlang', 'golang', 'groovy', 'haskell', 'java',
    'javascript', 'julia', 'kotlin', 'lua', 'matlab', 'objective-c', 'ocaml', 'perl', 'php',
    'python', 'r', 'ruby', 'rust', 'scala', 'shell', 'swift', 'typescript', 'zig',

    // Frontend frameworks & libraries
    'angular', 'astro', 'backbone.js', 'ember.js', 'gatsby', 'htmx', 'jquery', 'lit',
    'next.js', 'nuxt', 'preact', 'react', 'react native', 'remix', 'solid.js', 'svelte',
    'three.js', 'vue', 'webgl',

    // Backend frameworks
    'asp.net', 'django', 'express', 'fastapi', 'fastify', 'flask', 'gin', 'hapi',
    'laravel', 'nest.js', 'rails', 'spring', 'spring boot',

    // CSS & styling
    'bootstrap', 'bulma', 'css', 'emotion', 'less', 'material ui', 'sass', 'scss',
    'styled-components', 'tailwind',

    // Markup & templating
    'html', 'markdown', 'pug', 'handlebars',

    // Databases
    'cassandra', 'cockroachdb', 'couchdb', 'dynamodb', 'elasticsearch', 'firebase',
    'mariadb', 'memcached', 'mongodb', 'mysql', 'neo4j', 'nosql', 'oracle', 'planetscale',
    'postgresql', 'redis', 'sqlite', 'supabase',

    // Cloud & infra
    'aws', 'azure', 'cloudflare', 'digital ocean', 'gcp', 'heroku', 'linode', 'netlify',
    'render', 'vercel',

    // DevOps & CI/CD
    'ansible', 'argo cd', 'bash', 'chef', 'circleci', 'docker', 'github actions', 'gitlab ci',
    'helm', 'jenkins', 'kubernetes', 'puppet', 'terraform', 'vagrant',

    // Monitoring & observability
    'datadog', 'grafana', 'new relic', 'observability', 'prometheus', 'sentry', 'splunk',

    // Data & analytics
    'airflow', 'bigquery', 'dbt', 'flink', 'hadoop', 'hive', 'looker', 'pandas',
    'power bi', 'redshift', 'snowflake', 'spark', 'tableau',

    // ML / AI
    'computer vision', 'deep learning', 'embeddings', 'fine-tuning', 'huggingface',
    'keras', 'langchain', 'llm', 'machine learning', 'mlflow', 'nlp', 'openai', 'pinecone',
    'prompt engineering', 'pytorch', 'rag', 'scikit-learn', 'sklearn', 'tensorflow',
    'vector databases', 'weaviate',

    // Messaging & streaming
    'grpc', 'graphql', 'kafka', 'nats', 'rabbitmq', 'rest api', 'websockets',

    // Testing
    'cypress', 'enzyme', 'jest', 'mocha', 'playwright', 'pytest', 'react testing library',
    'selenium', 'storybook', 'testing', 'vitest',

    // Build tools & package managers
    'esbuild', 'gradle', 'gulp', 'maven', 'npm', 'nx', 'rollup', 'turborepo', 'vite',
    'webpack', 'yarn',

    // Design & UX
    'design systems', 'figma', 'illustrator', 'invision', 'photoshop', 'sketch',
    'ui design', 'ux research', 'web accessibility', 'zeplin',

    // Project management & methodology
    'agile', 'jira', 'kanban', 'lean', 'notion', 'scrum', 'trello', 'waterfall',

    // Security & auth
    'jwt', 'oauth', 'saml', 'sso',

    // API & architecture patterns
    'api design', 'api development', 'ci/cd', 'event-driven', 'microservices',
    'monorepo', 'serverless', 'soa',

    // Soft skills & business
    'analytical thinking', 'business analysis', 'communication', 'content strategy',
    'cross-functional', 'customer success', 'data analysis', 'data engineering',
    'devops', 'incident response', 'leadership', 'linux', 'marketing automation',
    'negotiation', 'presentation skills', 'problem solving', 'product analytics',
    'product management', 'project management', 'research', 'revenue operations',
    'risk management', 'seo', 'social media', 'stakeholder management', 'statistics',
    'storytelling', 'strategic planning', 'team management', 'workflow automation',

    // Platforms
    'excel', 'git', 'salesforce', 'shopify',
];

// Synonym map: alternate names → canonical skill name from SKILL_LIBRARY
const SKILL_SYNONYMS = {
    'js': 'javascript',
    'ts': 'typescript',
    'py': 'python',
    'rb': 'ruby',
    'go': 'golang',
    'node': 'node.js',
    'nodejs': 'node.js',
    'node js': 'node.js',
    'react.js': 'react',
    'reactjs': 'react',
    'react js': 'react',
    'vue.js': 'vue',
    'vuejs': 'vue',
    'vue js': 'vue',
    'angular.js': 'angular',
    'angularjs': 'angular',
    'next': 'next.js',
    'nextjs': 'next.js',
    'next js': 'next.js',
    'nuxt.js': 'nuxt',
    'nuxtjs': 'nuxt',
    'svelte.js': 'svelte',
    'sveltekit': 'svelte',
    'nestjs': 'nest.js',
    'nest': 'nest.js',
    'fastify.js': 'fastify',
    'expressjs': 'express',
    'express.js': 'express',
    'mongo': 'mongodb',
    'postgres': 'postgresql',
    'psql': 'postgresql',
    'pg': 'postgresql',
    'dynamo': 'dynamodb',
    'elastic': 'elasticsearch',
    'k8s': 'kubernetes',
    'k8': 'kubernetes',
    'kube': 'kubernetes',
    'tf': 'terraform',
    'gh actions': 'github actions',
    'gha': 'github actions',
    'ci cd': 'ci/cd',
    'cicd': 'ci/cd',
    'continuous integration': 'ci/cd',
    'continuous deployment': 'ci/cd',
    'aws lambda': 'serverless',
    'lambda': 'serverless',
    'gke': 'kubernetes',
    'eks': 'kubernetes',
    'aks': 'kubernetes',
    's3': 'aws',
    'ec2': 'aws',
    'rds': 'aws',
    'sqs': 'aws',
    'sns': 'aws',
    'ml': 'machine learning',
    'dl': 'deep learning',
    'ai': 'machine learning',
    'artificial intelligence': 'machine learning',
    'large language model': 'llm',
    'large language models': 'llm',
    'gpt': 'llm',
    'chatgpt': 'openai',
    'retrieval augmented generation': 'rag',
    'natural language processing': 'nlp',
    'scikit learn': 'scikit-learn',
    'sci-kit learn': 'scikit-learn',
    'torch': 'pytorch',
    'tf.js': 'tensorflow',
    'tensorflow.js': 'tensorflow',
    'tailwindcss': 'tailwind',
    'tailwind css': 'tailwind',
    'mui': 'material ui',
    'material-ui': 'material ui',
    'chakra': 'design systems',
    'ant design': 'design systems',
    'styled components': 'styled-components',
    'css-in-js': 'styled-components',
    'sass/scss': 'scss',
    'rest': 'rest api',
    'restful': 'rest api',
    'restful api': 'rest api',
    'rest apis': 'rest api',
    'graphql api': 'graphql',
    'gql': 'graphql',
    'websocket': 'websockets',
    'socket.io': 'websockets',
    'json web token': 'jwt',
    'json web tokens': 'jwt',
    'single sign-on': 'sso',
    'single sign on': 'sso',
    'pw': 'playwright',
    'rtl': 'react testing library',
    'unit testing': 'testing',
    'integration testing': 'testing',
    'e2e testing': 'testing',
    'end-to-end testing': 'testing',
    'test driven development': 'testing',
    'tdd': 'testing',
    'bdd': 'testing',
    'github': 'git',
    'gitlab': 'git',
    'bitbucket': 'git',
    'version control': 'git',
    'source control': 'git',
    'd3': 'data analysis',
    'd3.js': 'data analysis',
    'data visualization': 'data analysis',
    'data viz': 'data analysis',
    'bi': 'power bi',
    'powerbi': 'power bi',
    'apache kafka': 'kafka',
    'apache spark': 'spark',
    'apache airflow': 'airflow',
    'apache flink': 'flink',
    'pyspark': 'spark',
    'message queue': 'rabbitmq',
    'message broker': 'rabbitmq',
};

const ACTION_VERBS = [
    'accelerated', 'achieved', 'analyzed', 'architected', 'automated', 'built', 'collaborated',
    'created', 'delivered', 'designed', 'drove', 'executed', 'implemented', 'improved', 'increased',
    'launched', 'led', 'managed', 'optimized', 'owned', 'reduced', 'scaled', 'streamlined',
];

const DISPLAY_MAP = {
    api: 'API',
    apidesign: 'API Design',
    apidevelopment: 'API Development',
    apis: 'APIs',
    aspnet: 'ASP.NET',
    aws: 'AWS',
    azure: 'Azure',
    ci: 'CI',
    cicd: 'CI/CD',
    css: 'CSS',
    dbt: 'dbt',
    dynamodb: 'DynamoDB',
    gcp: 'GCP',
    github: 'GitHub',
    githubactions: 'GitHub Actions',
    gitlabci: 'GitLab CI',
    golang: 'Go',
    graphql: 'GraphQL',
    grpc: 'gRPC',
    html: 'HTML',
    htmx: 'HTMX',
    huggingface: 'HuggingFace',
    jira: 'Jira',
    jwt: 'JWT',
    langchain: 'LangChain',
    llm: 'LLM',
    mariadb: 'MariaDB',
    materialui: 'Material UI',
    mlflow: 'MLflow',
    mongodb: 'MongoDB',
    mysql: 'MySQL',
    neo4j: 'Neo4j',
    nestjs: 'Nest.js',
    nextjs: 'Next.js',
    nlp: 'NLP',
    nodejs: 'Node.js',
    nosql: 'NoSQL',
    oauth: 'OAuth',
    openai: 'OpenAI',
    postgresql: 'PostgreSQL',
    powerbi: 'Power BI',
    pytorch: 'PyTorch',
    rag: 'RAG',
    reactnative: 'React Native',
    restapi: 'REST API',
    saml: 'SAML',
    scikitlearn: 'Scikit-learn',
    scss: 'SCSS',
    seo: 'SEO',
    sklearn: 'Scikit-learn',
    soa: 'SOA',
    sql: 'SQL',
    sqlite: 'SQLite',
    sso: 'SSO',
    tensorflow: 'TensorFlow',
    ui: 'UI',
    ux: 'UX',
    webgl: 'WebGL',
    websockets: 'WebSockets',
};

const clampNumber = (value, min = 0, max = 100) => {
    if (Number.isNaN(Number(value))) {
        return min;
    }

    return Math.max(min, Math.min(max, Number(value)));
};

const round = (value, precision = 1) => {
    const factor = 10 ** precision;
    return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
};

const uniqueValues = (values = []) => [...new Set(values.filter(Boolean))];

const normalizeText = (value = '') =>
    value
        .toLowerCase()
        .replace(/[\u2013\u2014]/g, ' ')
        .replace(/[^\w\s+.#/-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

const tokenize = (value = '') =>
    normalizeText(value)
        .split(' ')
        .map((token) => token.trim().replace(/^[^a-z0-9+#]+|[^a-z0-9+#]+$/gi, ''))
        .filter((token) => token.length > 2 && !STOPWORDS.has(token));

const toDisplayLabel = (term = '') => {
    const compact = term.toLowerCase().replace(/[\s./-]/g, '');
    if (DISPLAY_MAP[compact]) {
        return DISPLAY_MAP[compact];
    }

    return term
        .split(' ')
        .map((chunk) => {
            if (!chunk) {
                return chunk;
            }

            if (chunk === chunk.toUpperCase()) {
                return chunk;
            }

            return chunk.charAt(0).toUpperCase() + chunk.slice(1);
        })
        .join(' ');
};

const extractSkills = (value = '') => {
    const normalized = ` ${normalizeText(value)} `;

    // Direct matches from the skill library
    const directMatches = SKILL_LIBRARY
        .filter((skill) => normalized.includes(` ${normalizeText(skill)} `));

    // Synonym matches: check if any synonym appears, map to canonical skill
    const synonymMatches = Object.entries(SKILL_SYNONYMS)
        .filter(([synonym]) => normalized.includes(` ${normalizeText(synonym)} `))
        .map(([, canonical]) => canonical)
        .filter((canonical) => !directMatches.includes(canonical));

    return uniqueValues([...directMatches, ...synonymMatches]).map(toDisplayLabel);
};

const extractKeywordFrequency = (value = '', limit = 18) => {
    const counts = tokenize(value).reduce((accumulator, token) => {
        accumulator[token] = (accumulator[token] || 0) + 1;
        return accumulator;
    }, {});

    return Object.entries(counts)
        .sort((left, right) => {
            if (right[1] === left[1]) {
                return left[0].localeCompare(right[0]);
            }
            return right[1] - left[1];
        })
        .slice(0, limit)
        .map(([term]) => toDisplayLabel(term));
};

const extractJobSignals = (jobDescription = '') => {
    const skills = extractSkills(jobDescription);
    const keywords = uniqueValues([...skills, ...extractKeywordFrequency(jobDescription, 20)]).slice(0, 20);

    return {
        skills,
        keywords,
    };
};

const extractBulletLines = (resumeText = '') =>
    resumeText
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => /^[-*•]/.test(line) || /^([A-Z][a-z]+ed|Managed|Built|Led|Created|Developed)\b/.test(line))
        .map((line) => line.replace(/^[-*•]\s*/, '').trim())
        .filter(Boolean);

const calculateResumeQuality = (resumeText = '') => {
    const normalized = normalizeText(resumeText);
    const wordCount = normalized ? normalized.split(' ').length : 0;
    const emailPresent = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(resumeText);
    const phonePresent = /(?:\+\d{1,3}[\s-]?)?(?:\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4})/.test(resumeText);
    const linkPresent = /(linkedin\.com|github\.com|portfolio|behance\.net)/i.test(resumeText);
    const quantifiedAchievements = (resumeText.match(/\b\d+(?:\.\d+)?%|\$\d[\d,.]*|\b\d+\+?\b/g) || []).length;
    const bulletLines = extractBulletLines(resumeText);
    const actionVerbHits = ACTION_VERBS.filter((verb) => normalized.includes(verb)).length;
    const sections = [
        /summary|profile|about/i.test(resumeText),
        /experience|employment|work history/i.test(resumeText),
        /skills|core competencies|toolkit/i.test(resumeText),
        /education|certifications/i.test(resumeText),
        /projects|portfolio|achievements/i.test(resumeText),
    ];

    let score = 0;
    if (emailPresent) score += 10;
    if (phonePresent) score += 10;
    if (linkPresent) score += 5;
    score += Math.min(sections.filter(Boolean).length * 10, 40);
    score += Math.min(quantifiedAchievements * 4, 15);
    score += Math.min(bulletLines.length * 2, 10);
    score += Math.min(actionVerbHits * 2, 10);

    if (wordCount >= 250 && wordCount <= 900) {
        score += 10;
    } else if (wordCount >= 150 && wordCount <= 1100) {
        score += 5;
    }

    const strengths = [];
    const risks = [];

    if (quantifiedAchievements >= 3) strengths.push('Includes quantified impact statements.');
    else risks.push('Add more measurable outcomes, percentages, or business results.');

    if (sections.filter(Boolean).length >= 4) strengths.push('Covers the main ATS-friendly resume sections.');
    else risks.push('Add clearer sections such as summary, skills, projects, and education.');

    if (bulletLines.length >= 4) strengths.push('Uses bullet formatting that is easier for recruiters to scan.');
    else risks.push('Break dense paragraphs into concise, achievement-oriented bullets.');

    if (wordCount < 250) risks.push('Resume is brief; add more relevant accomplishments and tools.');
    if (wordCount > 900) risks.push('Resume is long; tighten weaker lines so the strongest evidence stands out.');
    if (!emailPresent || !phonePresent) risks.push('Make sure contact details are easy to find.');
    if (linkPresent) strengths.push('Includes a portfolio or professional profile link.');

    return {
        score: clampNumber(round(score, 0)),
        details: {
            wordCount,
            emailPresent,
            phonePresent,
            linkPresent,
            quantifiedAchievements,
            bulletCount: bulletLines.length,
            sectionCoverage: sections.filter(Boolean).length,
        },
        strengths: uniqueValues(strengths),
        risks: uniqueValues(risks),
    };
};

module.exports = {
    clampNumber,
    round,
    uniqueValues,
    normalizeText,
    tokenize,
    toDisplayLabel,
    extractSkills,
    extractKeywordFrequency,
    extractJobSignals,
    extractBulletLines,
    calculateResumeQuality,
};
