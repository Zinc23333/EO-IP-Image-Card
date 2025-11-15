export async function onRequest({ request }: { request: EORequest }) {

  return new Response("0.0.1",
    {
      headers: {
        'content-type': 'application/json; charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}