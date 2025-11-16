import { getImageConfigParams } from "@/lib/image/image_config";
import { getBaseUrl } from "@/lib/utils/utils";

export function onRequest( {request, params}: { request: EORequest, params: { bg: string } } ) {
    const p = getImageConfigParams({ backgroundKey: params.bg, request });
    if (!p) {
        return new Response(`背景图片不存在`, {
            status: 404,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
    }

    return fetch(`${getBaseUrl({request})}/api/generate${p}`);
}