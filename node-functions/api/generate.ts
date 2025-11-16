import { generateImage } from "@/lib/image/generate_image";

export async function onRequestPost({ request }: { request: EORequest }): Promise<Response> {
  const formData = await request.formData();
  return generateImage(formData);
}

export default async function onRequestGet({ request }: { request: EORequest }): Promise<Response> {
  const { searchParams } = new URL(request.url);
  return generateImage(searchParams);
}
