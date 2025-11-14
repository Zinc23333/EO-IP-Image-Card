export async function onRequest({ request }: { request: EORequest }) {
  const eo = request.eo;
  const r = JSON.stringify({eo});

  const ips = await kv.get(`IP`);
  const ipd: Record<string, any> = JSON.parse(ips);
  ipd[`${eo.clientIp}`] = r;
  await kv.put(`IP`, JSON.stringify(ipd));

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