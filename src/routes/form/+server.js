import { readFileSync } from 'fs';
import { resolve } from 'path';

export function GET() {
	const html = readFileSync(resolve('static/remake/current-site/commission.html'), 'utf-8');
	return new Response(html, {
		headers: {
			'Content-Type': 'text/html; charset=utf-8',
			'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
		}
	});
}
