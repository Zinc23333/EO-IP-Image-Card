export function onRequest({ request }: { request: EORequest }) {
  const eo = request.eo;
  const r = JSON.stringify({eo});

  const ips = await KV.get(`IP`);
  const ipd: Record<string, any> = JSON.parse(ips);
  ipd[`${eo.clientIp}`] = r;
  await KV.put(`IP`, JSON.stringify(ipd));

  return new Response(
    r,
    {
      headers: {
        'content-type': 'application/json; charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}