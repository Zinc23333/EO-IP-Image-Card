import { getImageConfigUrl } from "@/lib/image_config";

export function onRequest( {request, params}: { request: EORequest, params: { bg: string } } ) {
    const urlParams = getImageConfigUrl({ background: params.bg, request });
    if (!urlParams) {
        return new Response(`背景图片不存在`, {
            status: 404,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
    }

    
    const host = request.headers.get('host') || '';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;
    return fetch(`${baseUrl}/api/img${urlParams}`);
}