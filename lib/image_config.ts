import { GenerateImageParams } from "./image_processor";
import { getGeoZh, getIspNameZh } from "./utils";

function getUrlFromParams(params: GenerateImageParams) {
    const ps: Object = {
        "bg": params.bgImg,
        "x": params.x,
        "y": params.y,
        "rotation": params.rotation,
        "fontSize": params.fontSize,
        "fontFamily": params.fontFamily,
        "defaultColor": params.defaultColor,
        "lineHeight": params.lineHeight,
        "text": params.text
    };

    let url = "?";
    for (const [key, value] of Object.entries(ps)) {
        if (value) 
            url += `${key}=${encodeURIComponent(value)}&`;
    }
    url = url.slice(0, -1);

    return url;
}

export function getImageConfigUrl({ background, request }: { background: string, request: EORequest }) {

    const place = getGeoZh({ request });
    const cisp = getIspNameZh({ request });
    const { longitude, latitude } = request.eo.geo;

    const images: Record<string, GenerateImageParams> = {
        "anan": {
            bgImg: '2',
            text: `你在 #253ef7{${place}}  正\n使用 #55ca16{${cisp}} 上网 \n 经度：#b79b0d{${longitude.toFixed(6)}}° \n 纬度：#bd2263{${latitude.toFixed(6)}}°`,
            x: 552, 
            y: 859,
            rotation: 0,
            fontSize: 64,
            fontFamily: 'Impact, sans-serif',
            defaultColor: '#000000'
        },
    }

    const params = images[background];
    if (!params)
        return null;
    else
        return getUrlFromParams(params);
}