import { GenerateImageParams } from "../types/generate_image_params";
import { getBaseUrl, getGeoZh, getIspNameZh } from "../utils/utils";

function getParamObject(params: GenerateImageParams): Object {
    return {
        "bgImg": params.bgImg,
        "x": params.x,
        "y": params.y,
        "rotation": params.rotation,
        "fontSize": params.fontSize,
        "fontFamily": params.fontFamily,
        "defaultColor": params.defaultColor,
        "lineHeight": params.lineHeight,
        "text": params.text
    };
}

function getUrlFromParams(params: GenerateImageParams) {
    const ps = getParamObject(params);

    let url = "?";
    for (const [key, value] of Object.entries(ps)) {
        if (value) 
            url += `${key}=${encodeURIComponent(value)}&`;
    }
    url = url.slice(0, -1);

    return url;
}

function getFormFromParams(params: GenerateImageParams) {
    const ps = getParamObject(params);

    const form = new FormData();
    for (const [key, value] of Object.entries(ps)) {
        if (value) 
            form.append(key, value);
    }

    return form;
}

function getImageConfig({ backgroundKey, request }: { backgroundKey: string, request: EORequest }) {

    const place = getGeoZh({ request });
    const cisp = getIspNameZh({ request });
    const { longitude, latitude } = request.eo.geo;
    const ip = request.eo.clientIp;

    // 字体来源：https://developer.huawei.com/consumer/cn/design/resource-V1/
    const images: Record<string, GenerateImageParams> = {
        "test": {
            bgImg: `${getBaseUrl({request})}/public/assets/bg/test.jpg`,  // 纯色图片
            text: `地点: #253ef7{${place}} \n ISP: #55ca16{${cisp}} \n 经度: #b79b0d{${longitude.toFixed(6)}}° \n 纬度: #bd2263{${latitude.toFixed(6)}}°\n IP: #1e6a99{${ip}}`,
            x: 250, 
            y: 150,
            rotation: 15,
            fontSize: 36,
            fontFamily: `${getBaseUrl({request})}/public/assets/fonts/HarmonyOS_Sans_SC_Medium.ttf`,
            defaultColor: '#ffffff'
        },
        "anan": {
            bgImg: `${getBaseUrl({request})}/public/assets/bg/anan.jpg`,  // 图片来源：魔女审判官方漫画
            text: `你在 #253ef7{【${place}】}  正\n使用 #55ca16{【${cisp}】} 上网 \n 经度: #b79b0d{${longitude.toFixed(6)}}° \n 纬度: #bd2263{${latitude.toFixed(6)}}°`,
            x: 242, 
            y: 369,
            rotation: 2,
            fontSize: 24,
            lineHeight: 1,
            fontFamily: `${getBaseUrl({request})}/public/assets/fonts/HarmonyOS_Sans_SC_Medium.ttf`,
            defaultColor: '#000000'
        },  
    }

    const params = images[backgroundKey];
    return params;
}

export function getImageConfigParams({ backgroundKey, request }: { backgroundKey: string, request: EORequest }) {
    const c = getImageConfig({backgroundKey, request});
    return getUrlFromParams(c);
}

export function getImageConfigForm({ backgroundKey, request }: { backgroundKey: string, request: EORequest }) {
    const c = getImageConfig({backgroundKey, request});
    return getFormFromParams(c);
}