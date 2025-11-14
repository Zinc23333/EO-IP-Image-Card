import { getImageConfigUrl } from "@/lib/image_config";

export function onRequest( {request, params}: { request: EORequest, params: { bg: string } } ) {
    const urlParams = getImageConfigUrl({ background: params.bg, request });
    return new Response(`User id is ${params.bg} || ${urlParams}`);
}