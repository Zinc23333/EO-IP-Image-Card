import mainProvince from '@/lib/translate/main_provinces.json'
import mainCities from '@/lib/translate/main_cities.json'
import otherRegions from '@/lib/translate/other_regions.json'

export function getGeoZh({ request }: { request: EORequest }) {
    const eo = request.eo;
    let name = "";

    if (eo.geo.countryCodeAlpha2 === "CN") {
        const provinceCode = eo.geo.regionCode.substring(3);
        name += mainProvince[provinceCode] || "";
        if (provinceCode && mainCities[provinceCode]) {
            name += mainCities[provinceCode][eo.geo.cityName] || "";
        }
    } else {
        name += otherRegions[eo.geo.countryCodeAlpha2] || "";
    }
    return name;
}

export function getIspNameZh({ request }: { request: EORequest }) {
    const eo = request.eo;
    if (eo.geo.cisp.substring(0, 2) === "中国") {
        return eo.geo.cisp.substring(2);
    } else {
        return eo.geo.cisp;
    }
}

export function getBaseUrl( {request}: { request: EORequest } ) {
    const host = request.headers.get('host') || '';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;
    return baseUrl;
} 

export function debugRequestInfo({request}) {
  // 获取request的详细信息
  const requestInfo = {
    url: request.url,
    method: request.method,
    headers: {},
    redirect: request.redirect,
    referrer: request.referrer,
    referrerPolicy: request.referrerPolicy,
  };

  // 获取所有的请求头
  for (const [key, value] of request.headers.entries()) {
    requestInfo.headers[key] = value;
  }

  // 将request信息转换为格式化的JSON字符串
  const requestInfoString = JSON.stringify(requestInfo, null, 2);

  return `Request Info:\n${requestInfoString}`;
  
}