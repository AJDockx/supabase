const API_URL = process.env.NEXT_PUBLIC_API_URL
  ? new URL(process.env.NEXT_PUBLIC_API_URL).origin
  : ''
const SUPABASE_URL = process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).origin : ''
const GOTRUE_URL = process.env.NEXT_PUBLIC_GOTRUE_URL
  ? new URL(process.env.NEXT_PUBLIC_GOTRUE_URL).origin
  : ''
const SUPABASE_PROJECTS_URL = 'https://*.supabase.co'
const SUPABASE_PROJECTS_URL_WS = 'wss://*.supabase.co'

// construct the URL for the Websocket Local URLs
let SUPABASE_LOCAL_PROJECTS_URL_WS = ''
if (SUPABASE_URL) {
  const url = new URL(SUPABASE_URL)
  const wsUrl = `${url.hostname}:${url.port}`
  SUPABASE_LOCAL_PROJECTS_URL_WS = `ws://${wsUrl} wss://${wsUrl}`
}

// Needed to test docs search in local dev
const SUPABASE_DOCS_PROJECT_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
  : ''

const SUPABASE_STAGING_PROJECTS_URL = 'https://*.supabase.red'
const SUPABASE_STAGING_PROJECTS_URL_WS = 'wss://*.supabase.red'
const SUPABASE_COM_URL = 'https://supabase.com'
const CLOUDFLARE_CDN_URL = 'https://cdnjs.cloudflare.com'
const HCAPTCHA_SUBDOMAINS_URL = 'https://*.hcaptcha.com'
const HCAPTCHA_ASSET_URL = 'https://newassets.hcaptcha.com'
const HCAPTCHA_JS_URL = 'https://js.hcaptcha.com'
const CONFIGCAT_URL = 'https://cdn-global.configcat.com'
const STRIPE_SUBDOMAINS_URL = 'https://*.stripe.com'
const STRIPE_JS_URL = 'https://js.stripe.com'
const STRIPE_NETWORK_URL = 'https://*.stripe.network'
const CLOUDFLARE_URL = 'https://www.cloudflare.com'
const ONE_ONE_ONE_ONE_URL = 'https://one.one.one.one'
const VERCEL_URL = 'https://vercel.com'
const VERCEL_INSIGHTS_URL = 'https://*.vercel-insights.com'
const GITHUB_API_URL = 'https://api.github.com'
const GITHUB_USER_CONTENT_URL = 'https://raw.githubusercontent.com'
const GITHUB_USER_AVATAR_URL = 'https://avatars.githubusercontent.com'
const GOOGLE_USER_AVATAR_URL = 'https://lh3.googleusercontent.com'

// This is a custom domain for Stape, which isused for GTM servers
const STAPE_URL = 'https://ss.supabase.com'

// Google Analytics v4 URLs
const GOOGLE_TAG_MANAGER_URL = 'https://*.googletagmanager.com'
const GOOGLE_TAG_MANAGER_IMG_URL = `${GOOGLE_TAG_MANAGER_URL} https://*.google-analytics.com`
const GOOGLE_ADS_URLS = 'https://googleads.g.doubleclick.net https://www.googleadservices.com'
const GOOGLE_ANALYTICS_URL = 'https://*.google-analytics.com'
const GOOGLE_DOUBLECLICK_URL = 'https://*.g.doubleclick.net'
const GOOGLE_URL = 'https://*.google.com'
const GOOGLE_PAGEAD_URL = 'https://pagead2.googlesyndication.com'
const GOOGLE_TD_DOUBLECLICK_URL = 'https://td.doubleclick.net'
const GOOGLE_WWW_TAG_MANAGER_URL = 'https://www.googletagmanager.com'

const VERCEL_LIVE_URL = 'https://vercel.live'
const SENTRY_URL =
  'https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://*.ingest.de.sentry.io'
const SUPABASE_ASSETS_URL =
  process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging'
    ? 'https://frontend-assets.supabase.green'
    : 'https://frontend-assets.supabase.com'

const USERCENTRICS_URLS = 'https://*.usercentrics.eu'
const USERCENTRICS_APP_URL = 'https://app.usercentrics.eu'

// used by vercel live preview
const PUSHER_URL = 'https://*.pusher.com'
const PUSHER_URL_WS = 'wss://*.pusher.com'

async function getGoogleDomains() {
  const response = await fetch('https://www.google.com/supported_domains')
  const data = await response.text()
  return data
    .split('\n')
    .map((domain) => `https://*${domain.trim()}`)
    .join(' ')
}

exports.getCSP = async () => {
  const googleDomains = await getGoogleDomains()

  const DEFAULT_SRC_URLS = [
    API_URL,
    SUPABASE_URL,
    GOTRUE_URL,
    SUPABASE_LOCAL_PROJECTS_URL_WS,
    SUPABASE_PROJECTS_URL,
    SUPABASE_PROJECTS_URL_WS,
    HCAPTCHA_SUBDOMAINS_URL,
    CONFIGCAT_URL,
    STRIPE_SUBDOMAINS_URL,
    STRIPE_NETWORK_URL,
    CLOUDFLARE_URL,
    ONE_ONE_ONE_ONE_URL,
    VERCEL_INSIGHTS_URL,
    GITHUB_API_URL,
    GITHUB_USER_CONTENT_URL,
    SUPABASE_ASSETS_URL,
    USERCENTRICS_URLS,
    GOOGLE_ANALYTICS_URL,
    GOOGLE_TAG_MANAGER_URL,
    GOOGLE_DOUBLECLICK_URL,
    GOOGLE_URL,
    GOOGLE_PAGEAD_URL,
  ]
  const SCRIPT_SRC_URLS = [
    CLOUDFLARE_CDN_URL,
    HCAPTCHA_JS_URL,
    STRIPE_JS_URL,
    SUPABASE_ASSETS_URL,
    GOOGLE_TAG_MANAGER_URL,
  ]
  const FRAME_SRC_URLS = [
    HCAPTCHA_ASSET_URL,
    STRIPE_JS_URL,
    STAPE_URL,
    // Google Analytics v4 frame-src URLs
    GOOGLE_TD_DOUBLECLICK_URL,
    GOOGLE_WWW_TAG_MANAGER_URL,
  ]
  const IMG_SRC_URLS = [
    SUPABASE_URL,
    SUPABASE_COM_URL,
    SUPABASE_PROJECTS_URL,
    GITHUB_USER_AVATAR_URL,
    GOOGLE_USER_AVATAR_URL,
    SUPABASE_ASSETS_URL,
    USERCENTRICS_APP_URL,
    GOOGLE_TAG_MANAGER_IMG_URL,
    STAPE_URL,
    GOOGLE_ADS_URLS,
    // Google Analytics v4 img-src URLs
    GOOGLE_ANALYTICS_URL,
    GOOGLE_TAG_MANAGER_URL,
    GOOGLE_DOUBLECLICK_URL,
    GOOGLE_URL,
  ]
  const STYLE_SRC_URLS = [CLOUDFLARE_CDN_URL, SUPABASE_ASSETS_URL]
  const FONT_SRC_URLS = [CLOUDFLARE_CDN_URL, SUPABASE_ASSETS_URL]

  const isDevOrStaging =
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' ||
    process.env.NEXT_PUBLIC_ENVIRONMENT === 'local' ||
    process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging'

  const defaultSrcDirective = [
    `default-src 'self'`,
    ...DEFAULT_SRC_URLS,
    ...(isDevOrStaging
      ? [
          SUPABASE_STAGING_PROJECTS_URL,
          SUPABASE_STAGING_PROJECTS_URL_WS,
          VERCEL_LIVE_URL,
          SUPABASE_DOCS_PROJECT_URL,
        ]
      : []),
    PUSHER_URL_WS,
    SENTRY_URL,
    googleDomains,
  ].join(' ')

  const imgSrcDirective = [
    `img-src 'self'`,
    `blob:`,
    `data:`,
    ...IMG_SRC_URLS,
    ...(isDevOrStaging ? [SUPABASE_STAGING_PROJECTS_URL, VERCEL_URL] : []),
    googleDomains,
  ].join(' ')

  const scriptSrcDirective = [
    `script-src 'self'`,
    `'unsafe-eval'`,
    `'unsafe-inline'`,
    ...SCRIPT_SRC_URLS,
    VERCEL_LIVE_URL,
    PUSHER_URL,
  ].join(' ')

  const frameSrcDirective = [`frame-src 'self'`, ...FRAME_SRC_URLS, VERCEL_LIVE_URL].join(' ')

  const styleSrcDirective = [
    `style-src 'self'`,
    `'unsafe-inline'`,
    ...STYLE_SRC_URLS,
    VERCEL_LIVE_URL,
  ].join(' ')

  const fontSrcDirective = [`font-src 'self'`, ...FONT_SRC_URLS, VERCEL_LIVE_URL].join(' ')

  const workerSrcDirective = [`worker-src 'self'`, `blob:`, `data:`].join(' ')

  const cspDirectives = [
    defaultSrcDirective,
    imgSrcDirective,
    scriptSrcDirective,
    frameSrcDirective,
    styleSrcDirective,
    fontSrcDirective,
    workerSrcDirective,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `block-all-mixed-content`,
    ...(process.env.NEXT_PUBLIC_IS_PLATFORM === 'true' &&
    process.env.NEXT_PUBLIC_ENVIRONMENT === 'prod'
      ? [`upgrade-insecure-requests`]
      : []),
  ]

  const csp = cspDirectives.join('; ') + ';'

  return csp
}
