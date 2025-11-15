export async function onRequest({ request }: { request: EORequest }) {
  const eo = request.eo;
  const r = JSON.stringify({eo});


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