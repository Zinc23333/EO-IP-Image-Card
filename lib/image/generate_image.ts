import { generateImageWithText } from '@/lib/image/process_image';
import { GenerateImageParams } from '@/lib/types/generate_image_params';
export async function generateImage(data: URLSearchParams | FormData): Promise<Response> {
  try {
    // 1. 解析和验证必要的参数
    const bgImg = data.get('bgImg') as string;
    const text = data.get('text') as string;
    
    if (!bgImg || !text) {
      return new Response(`缺少必要的参数 "bgImg" 或 "text" (${typeof data})`, {
        status: 400,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    // 2. 构建背景图片路径并读取文件
    const resp = await fetch(bgImg);

    if (!resp.ok) {
      return new Response(`背景图片不存在: ${bgImg}}`, {
        status: 404,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    const bgImgArrayBuffer = await resp.arrayBuffer();
    const bgImgBuffer = Buffer.from(bgImgArrayBuffer);

    // 3. 准备 generateImageWithText 函数的参数
    const options: GenerateImageParams = {
      bgImg: bgImgBuffer,
      text: text,
      x: parseInt(data.get('x') as string || '0', 10),
      y: parseInt(data.get('y') as string || '0', 10),
      rotation: parseFloat(data.get('rotation') as string || '0'),
      fontSize: parseInt(data.get('fontSize') as string || '50', 10),
      fontFamily: data.get('fontFamily') as string || 'sans-serif',
      defaultColor: data.get('defaultColor') as string || '#000000',
      lineHeight: parseFloat(data.get('lineHeight') as string || '1.2'),
    };

    // 4. 调用核心函数生成图片
    const finalImageBuffer = await generateImageWithText(options);

    // 5. 返回 JPG 图片响应
    return new Response(new Uint8Array(finalImageBuffer), { // 使用 Uint8Array 避免潜在的类型问题
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return new Response(`服务器内部错误: ${errorMessage}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
