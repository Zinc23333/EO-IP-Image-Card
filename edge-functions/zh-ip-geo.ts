import { getGeoZh } from '@/lib/utils'

export function onRequest({ request }: { request: EORequest }) {
  const name = getGeoZh({ request });
  return new Response(name);
}