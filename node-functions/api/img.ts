import { promises as fs } from 'fs';
import path from 'path';
import { generateImageWithText } from '@/lib/image_processor';
import { GenerateImageParams } from '@/lib/generate_image_params';

/**
 * Serverless Function 入口
 * @param {object} context - 平台传入的上下文对象
 * @param {Request} context.request - 包含请求信息的标准 Request 对象
 * @returns {Promise<Response>} Fetch API 标准的 Response 对象
 */
export default async function onRequest(context: { request: Request }): Promise<Response> {
  try {
    // 关键修改：从 context.request.url 获取 URL
    const { searchParams } = new URL(context.request.url);

    // 1. 解析和验证必要的参数
    const bg = searchParams.get('bg');
    const text = searchParams.get('text');

    if (!bg || !text) {
      return new Response('缺少必要的参数 "bg" 或 "text"', {
        status: 400,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    // 2. 构建背景图片路径并读取文件
    const assetUrl = new URL(`/public/assets/bg/${bg}.webp`, context.request.url);
    const resp = await fetch(assetUrl);

    if (!resp.ok) {
      console.error("读取背景图片失败:", assetUrl.href);
      return new Response(`背景图片不存在: ${bg}.webp (${assetUrl.href})`, {
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
      x: parseInt(searchParams.get('x') || '0', 10),
      y: parseInt(searchParams.get('y') || '0', 10),
      rotation: parseFloat(searchParams.get('rotation') || '0'),
      fontSize: parseInt(searchParams.get('fontSize') || '50', 10),
      fontFamily: searchParams.get('fontFamily') || 'sans-serif',
      defaultColor: searchParams.get('defaultColor') || '#000000',
      lineHeight: parseFloat(searchParams.get('lineHeight') || '1.2'),
    };

    // 4. 调用核心函数生成图片
    const finalImageBuffer = await generateImageWithText(options);

    // 5. 返回 PNG 图片响应
    return new Response(new Uint8Array(finalImageBuffer), { // 使用 Uint8Array 避免潜在的类型问题
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });

  } catch (error) {
    console.error('图片生成过程中发生未知错误:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return new Response(`服务器内部错误: ${errorMessage}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}