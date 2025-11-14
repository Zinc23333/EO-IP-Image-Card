import { getImageConfigUrl } from "@/lib/image_config";

export async function onRequest( {request, params}: { request: EORequest, params: { bg: string } } ) {
    const urlParams = getImageConfigUrl({ background: params.bg, request });
    if (!urlParams)
        return new Response(`背景图片不存在`, {
            status: 404,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
    return await fetch(`/img${urlParams}`);
}