export function onRequest({ request }: { request: EORequest }) {
  const eo = request.eo;

  return new Response(
    JSON.stringify({
      eo,
    }),
    {
      headers: {
        'content-type': 'application/json; charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}