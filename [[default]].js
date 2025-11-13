// 注意：这是一个根据文档描述编写的示例代码，具体对象和属性名称请参考最新的腾讯云官方文档。

async function handleRequest(request) {
  // EdgeOne 将地理位置信息附加到请求对象上，通常在一个名为 'edge' 或 'eo' 的属性中
  const geo = request.edge.geolocation;

  const locationData = {
    ip: request.headers.get('EO-Client-IP'), // 假设获取客户端IP的请求头
    city: geo.city,
    region: geo.region,
    country: geo.country,
    latitude: geo.latitude,
    longitude: geo.longitude,
    asn: geo.asn,
  };

  return new Response(JSON.stringify(locationData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});