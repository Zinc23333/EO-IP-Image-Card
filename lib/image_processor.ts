import sharp, { Sharp, Metadata } from 'sharp';
import { GenerateImageParams } from './generate_image_params';

// 定义解析后文本片段的类型，使用"可辨识联合类型"
type TextSegment = {
  type: 'text';
  content: string;
  color: string | null;
};
type NewlineSegment = {
  type: 'newline';
};
type ParsedSegment = TextSegment | NewlineSegment;

// 定义 SVG 创建函数的选项接口
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

/**
 * 解析自定义格式的文本字符串。
 * @param text - 例如 "你好 #ff0000{晴天}"
 * @returns 返回一个描述文本段和换行的对象数组
 */
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

/**
 * 根据解析后的片段和参数动态生成SVG。
 * @param segments - 解析后的文本片段
 * @param options - 包含字体、位置、旋转等信息的配置对象
 * @returns SVG 字符串
 */
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
    rotation,
  } = options;
  
  const lineCount = segments.filter(seg => seg.type === 'newline').length + 1;
  const totalTextBlockHeight = (lineCount - 1) * fontSize * lineHeight;
  const startY = y - totalTextBlockHeight / 2;
  
  let tspanElements = '';
  segments.forEach(segment => {
    if (segment.type === 'text') {
      const color = segment.color || defaultColor;
      const escapedContent = segment.content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
      tspanElements += `<tspan fill="${color}">${escapedContent}</tspan>`;
    } else if (segment.type === 'newline') {
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

/**
 * 在背景图片上添加经过样式化和旋转的文本。
 * @param params - 参数对象
 * @returns 返回一个包含最终图片的Buffer
 */
export async function generateImageWithText({
  bgImg,
  text,
  x,
  y,
  rotation = 0,
  fontSize = 50,
  fontFamily = 'sans-serif',
  defaultColor = '#000000',
  lineHeight = 1.2,
}: GenerateImageParams): Promise<Buffer> {

  try {
    const image: Sharp = sharp(bgImg);
    const metadata: Metadata = await image.metadata();

    const parsedSegments: ParsedSegment[] = parseStyledText(text);

    const svgOptions: CreateSvgOptions = {
      fontSize,
      fontFamily,
      defaultColor,
      lineHeight,
      width: metadata.width as number,
      height: metadata.height as number,
      x,
      y,
      rotation,
    };
    
    const svgText: string = createTextSvg(parsedSegments, svgOptions);
    const svgBuffer: Buffer = Buffer.from(svgText);

    const finalImageBuffer: Buffer = await image
      .composite([
        {
          input: svgBuffer,
          top: 0,
          left: 0,
        },
      ])
      .toBuffer();

    return finalImageBuffer;
  } catch (error) {
    console.error('生成图片时发生错误:', error);
    throw error;
  }
}