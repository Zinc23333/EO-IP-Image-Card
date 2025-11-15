import { createCanvas, loadImage } from '@napi-rs/canvas';
import { GenerateImageParams } from './generate_image_params';

// -------- 原来的文本解析函数保持不变 --------
type TextSegment = {
  type: 'text';
  content: string;
  color: string | null;
};
type NewlineSegment = { type: 'newline' };
type ParsedSegment = TextSegment | NewlineSegment;

function parseStyledText(text: string): ParsedSegment[] {
  const segments: ParsedSegment[] = [];
  const regex = /(#[0-9a-fA-F]{6})\{(.+?)\}|(\n)|([^#\n]+)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match[1] && match[2]) {
      segments.push({ type: 'text', content: match[2], color: match[1] });
    } else if (match[3]) {
      segments.push({ type: 'newline' });
    } else if (match[4]) {
      segments.push({ type: 'text', content: match[4], color: null });
    }
  }
  return segments;
}

// -------- 生成 SVG（逻辑不变） --------
interface CreateSvgOptions {
  fontSize: number;
  fontFamily: string;
  defaultColor: string;
  lineHeight: number;
  width: number;
  height: number;
  x: number;
  y: number;
  rotation: number;
}

function createTextSvg(segments: ParsedSegment[], options: CreateSvgOptions): string {
  const {
    fontSize,
    fontFamily,
    defaultColor,
    lineHeight,
    width,
    height,
    x,
    y,
    rotation
  } = options;

  const lineCount = segments.filter(s => s.type === 'newline').length + 1;
  const totalTextBlockHeight = (lineCount - 1) * fontSize * lineHeight;
  const startY = y - totalTextBlockHeight / 2;

  let tspanElements = '';
  segments.forEach(segment => {
    if (segment.type === 'text') {
      const color = segment.color || defaultColor;
      const escapedContent = segment.content
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

      tspanElements += `<tspan fill="${color}">${escapedContent}</tspan>`;
    } else {
      tspanElements += `<tspan x="${x}" dy="${fontSize * lineHeight}"> </tspan>`;
    }
  });

  return `
    <svg width="${width}" height="${height}">
      <text
        x="${x}"
        y="${startY}"
        font-family="${fontFamily}"
        font-size="${fontSize}"
        text-anchor="middle"
        dominant-baseline="middle"
        transform="rotate(${rotation}, ${x}, ${y})"
        fill="${defaultColor}"
      >
        ${tspanElements}
      </text>
    </svg>
  `;
}

// -------- 🔥 完整替代 Sharp 的 Serverless 方案 --------
export async function generateImageWithText({
  bgImg,
  text,
  x,
  y,
  rotation = 0,
  fontSize = 50,
  fontFamily = 'sans-serif',
  defaultColor = '#000000',
  lineHeight = 1.2
}: GenerateImageParams): Promise<Buffer> {

  // 加载背景图片
  const bg = await loadImage(bgImg);
  const width = bg.width;
  const height = bg.height;

  // 创建 Canvas
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 绘制背景图
  ctx.drawImage(bg, 0, 0, width, height);

  // 生成 SVG
  const parsed = parseStyledText(text);

  const svgText = createTextSvg(parsed, {
    fontSize,
    fontFamily,
    defaultColor,
    lineHeight,
    width,
    height,
    x,
    y,
    rotation
  });

  // 载入 SVG
  const svgImg = await loadImage(Buffer.from(svgText));

  // 绘制 SVG 到 Canvas（Overlay）
  ctx.drawImage(svgImg, 0, 0);

  // 输出 PNG buffer
  return canvas.toBuffer('image/png');
}
