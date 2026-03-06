import { json } from '@sveltejs/kit';

async function crawl(webapp_url) {
    if (webapp_url == null) return null;

    if (!webapp_url.toLowerCase().startsWith('https://') && !webapp_url.toLowerCase().startsWith('http://')) {
        webapp_url = 'https://' + webapp_url;
    }

    const webapp = {
        url: webapp_url,
        icon: '/images/xp/icons/ApplicationWindow.png',
        name: 'Untitled Program',
        desc: ''
    };

    try {
        const response = await fetch(webapp_url, { redirect: 'follow' });

        if (response.headers.get('x-frame-options') != null) {
            return null;
        }

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
            const href = faviconTag[1];
            webapp.icon = href.startsWith('http') ? href : new URL(href, finalUrl).href;
        } else {
            webapp.icon = new URL('/favicon.ico', finalUrl).href;
        }
    } catch (error) {
        // silently fail, return default webapp info
    }

    return webapp;
}

export async function GET({ request }) {
    const webapp_url = request.headers.get('webapp_url');
    const webapp = await crawl(webapp_url);
    return json({ webapp });
}
