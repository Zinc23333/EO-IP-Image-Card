/**
 * EdgeOne Node Functions
 * 文件路径: ./node-functions/index.js
 * 访问路径: https://your-domain.com/
 *
 * @param {object} context - EdgeOne 注入的事件上下文对象
 * @returns {Response}
 */
export default function onRequest(context) {
  // 从 context 对象中安全地获取 geo 和 clientIp
  const geo = context.geo || {};
  const clientIp = context.clientIp || 'unknown';
  const uuid = context.uuid || 'unknown';

  // 准备要返回的数据对象
  // 属性名（country, region 等）基于 EdgeOne 的标准
  const locationData = {
    uuid: uuid,
    ip: clientIp,
    asn: geo.asn,
    countryName: geo.countryName,
    countryCodeAlpha2: geo.countryCodeAlpha2,
    countryCodeAlpha3: geo.countryCodeAlpha3,
    countryCodeNumeric: geo.countryCodeNumeric,
    regionName: geo.regionName,
    regionCode: geo.regionCode,
    cityName: geo.cityName,
    latitude: geo.latitude,
    longitude: geo.longitude,
  };

  const body = JSON.stringify(locationData);

  return new Response(body, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*', // 允许跨域访问
    },
  });
}