import { json } from '@sveltejs/kit';

function isPrivateUrl(urlString) {
    let parsed;
    try { parsed = new URL(urlString); } catch { return true; }

    if (!['http:', 'https:'].includes(parsed.protocol)) return true;

    const host = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, '');

    if (host === 'localhost' || host === '0.0.0.0') return true;

    // IPv6 loopback / private
    if (host === '::1' || host.startsWith('fc') || host.startsWith('fd')) return true;

    // IPv4 private ranges
    const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipv4) {
        const [a, b] = [+ipv4[1], +ipv4[2]];
        if (a === 10) return true;                          // 10.0.0.0/8
        if (a === 127) return true;                         // 127.0.0.0/8
        if (a === 169 && b === 254) return true;            // 169.254.0.0/16 link-local
        if (a === 172 && b >= 16 && b <= 31) return true;  // 172.16.0.0/12
        if (a === 192 && b === 168) return true;            // 192.168.0.0/16
        if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 CGNAT
        if (a === 0 || a >= 224) return true;               // 0.x and multicast/reserved
    }

    return false;
}

function sanitizeIconUrl(href, baseUrl) {
    try {
        const iconUrl = href.startsWith('http') ? href : new URL(href, baseUrl).href;
        const parsed = new URL(iconUrl);
        if (!['http:', 'https:'].includes(parsed.protocol)) return null;
        if (isPrivateUrl(iconUrl)) return null;
        return iconUrl;
    } catch {
        return null;
    }
}

function is_embeddable(headers) {
    const xfo = (headers.get('x-frame-options') ?? '').toUpperCase().trim();
    if (xfo === 'DENY' || xfo === 'SAMEORIGIN') return false;

    const csp = headers.get('content-security-policy') ?? '';
    if (csp.includes('frame-ancestors')) {
        const fa = csp.match(/frame-ancestors\s+([^;]+)/)?.[1]?.trim() ?? '';
        if (!fa.includes('*') && !fa.includes('https:') && !fa.includes('http:')) return false;
    }

    return true;
}

async function crawl(webapp_url) {
    if (webapp_url == null) return null;

    if (!webapp_url.toLowerCase().startsWith('https://') && !webapp_url.toLowerCase().startsWith('http://')) {
        webapp_url = 'https://' + webapp_url;
    }

    if (isPrivateUrl(webapp_url)) return null;

    const webapp = {
        url: webapp_url,
        icon: '/images/xp/icons/ApplicationWindow.png',
        name: 'Untitled Program',
        desc: ''
    };

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(webapp_url, {
            redirect: 'follow',
            signal: controller.signal
        });
        clearTimeout(timeout);

        if (!is_embeddable(response.headers)) return null;

        const html = await response.text();
        const finalUrl = response.url || webapp_url;

        const ogSiteName = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i)
                        || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:site_name["']/i);
        const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
                     || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
        const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)
                    || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i)
                    || html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
                    || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
        const faviconTag = html.match(/<link[^>]*rel=["'][^"']*icon[^"']*["'][^>]*href=["']([^"']+)["']/i)
                        || html.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["'][^"']*icon[^"']*["']/i);

        const name = ogSiteName?.[1] || ogTitle?.[1] || titleTag?.[1];
        if (name?.trim()) webapp.name = name.trim();
        if (ogDesc?.[1]?.trim()) webapp.desc = ogDesc[1].trim();

        if (faviconTag?.[1]) {
            webapp.icon = sanitizeIconUrl(faviconTag[1], finalUrl) ?? webapp.icon;
        } else {
            webapp.icon = sanitizeIconUrl('/favicon.ico', finalUrl) ?? webapp.icon;
        }
    } catch {
        // silently fail, return default webapp info
    }

    return webapp;
}

export async function GET({ url }) {
    const webapp_url = url.searchParams.get('url');
    const webapp = await crawl(webapp_url);
    return json({ webapp });
}
