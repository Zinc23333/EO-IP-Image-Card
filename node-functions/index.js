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
  const clientIp = context.clientIp || 'IP Not Found';

  // 准备要返回的数据对象
  // 属性名（country, region 等）基于 EdgeOne 的标准
  const locationData = {
    ip: clientIp,
    country: geo.country,
    region: geo.region,
    city: geo.city,
    latitude: geo.latitude,
    longitude: geo.longitude,
    asn: geo.asn,
  };

  // 将数据对象转换为格式化的 JSON 字符串
  const body = JSON.stringify(locationData, null, 2);

  // 返回一个标准的 Response 对象
  return new Response(body, {
    // 必须设置正确的 headers
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*', // 允许跨域访问
    },
  });
}