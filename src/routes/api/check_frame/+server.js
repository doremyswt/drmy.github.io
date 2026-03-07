import { json } from '@sveltejs/kit';

export async function GET({ url }) {
    const target = url.searchParams.get('url');
    if (!target) return json({ blocked: false });

    try {
        const res = await fetch(target, {
            method: 'HEAD',
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 5.1; rv:11.0) Gecko Firefox/11.0' }
        });
        const xfo = (res.headers.get('x-frame-options') ?? '').toUpperCase().trim();
        if (xfo === 'DENY' || xfo === 'SAMEORIGIN') {
            return json({ blocked: true });
        }
        const csp = res.headers.get('content-security-policy') ?? '';
        if (csp.includes('frame-ancestors') && !csp.includes('frame-ancestors *')) {
            return json({ blocked: true });
        }
        return json({ blocked: false });
    } catch {
        return json({ blocked: false });
    }
}
