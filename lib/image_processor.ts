// lib/image_processor.ts
import { initWasm, Resvg } from "@resvg/resvg-wasm";
import { GenerateImageParams } from "./generate_image_params";

type TextSegment = { type: "text"; content: string; color: string | null };
type NewlineSegment = { type: "newline" };
type ParsedSegment = TextSegment | NewlineSegment;

function parseStyledText(text: string): ParsedSegment[] {
  const segments: ParsedSegment[] = [];
  const regex = /(#[0-9a-fA-F]{6})\{(.+?)\}|(\n)|([^#\n]+)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match[1] && match[2]) segments.push({ type: "text", content: match[2], color: match[1] });
    else if (match[3]) segments.push({ type: "newline" });
    else if (match[4]) segments.push({ type: "text", content: match[4], color: null });
  }
  return segments;
}

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
  const { fontSize, fontFamily, defaultColor, lineHeight, width, height, x, y, rotation } = options;
  const lineCount = segments.filter(s => s.type === "newline").length + 1;
  const totalTextBlockHeight = (lineCount - 1) * fontSize * lineHeight;
  const startY = y - totalTextBlockHeight / 2;

  let tspanElements = "";
  segments.forEach(segment => {
    if (segment.type === "text") {
      const color = segment.color || defaultColor;
      const escaped = segment.content
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
      tspanElements += `<tspan fill="${color}">${escaped}</tspan>`;
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

// Helper: convert an ArrayBuffer to base64 string
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  // create Uint8Array then Buffer
  const u8 = new Uint8Array(buffer);
  return Buffer.from(u8).toString("base64");
}

// Main function
export async function generateImageWithText(params: GenerateImageParams): Promise<Buffer> {
  const {
    bgImg,
    text,
    x,
    y,
    rotation = 0,
    fontSize = 50,
    fontFamily = "sans-serif",
    defaultColor = "#000000",
    lineHeight = 1.2,
  } = params;

  // 1) 初始化 resvg wasm（从 CDN 拉取 wasm）
  //   你可以锁定到某个版本，例如：https://unpkg.com/@resvg/resvg-wasm@0.6.1/index_bg.wasm
  const wasmUrl = "https://unpkg.com/@resvg/resvg-wasm@0.6.1/index_bg.wasm";
  const wasmResp = await fetch(wasmUrl);
  if (!wasmResp.ok) throw new Error(`Failed to fetch resvg wasm: ${wasmResp.status}`);
  const wasmArrayBuffer = await wasmResp.arrayBuffer();
  await initWasm(new Uint8Array(wasmArrayBuffer)); // 用 Uint8Array 传入

  // 2) 准备背景图 base64 data URL
  let bgDataUrl: string;
  if (Buffer.isBuffer(bgImg)) {
    bgDataUrl = `data:image/png;base64,${(bgImg as Buffer).toString("base64")}`;
  } else if (typeof bgImg === "string" && bgImg.startsWith("data:")) {
    bgDataUrl = bgImg;
  } else if (typeof bgImg === "string") {
    // bgImg is a URL; fetch it
    const resp = await fetch(bgImg);
    if (!resp.ok) throw new Error(`Failed to fetch background image: ${resp.status}`);
    const ab = await resp.arrayBuffer();
    const base64 = arrayBufferToBase64(ab);
    // try to detect mime from response header
    const contentType = resp.headers.get("content-type") || "image/png";
    bgDataUrl = `data:${contentType};base64,${base64}`;
  } else {
    throw new Error("Unsupported bgImg type");
  }

  // 3) we need width/height. Use a minimal SVG <image> to rely on image intrinsic size.
  //    But resvg needs explicit size. If you know the size externally, pass it in.
  //    Here we will render with fit="original" if possible, but to be safe we'll attempt to decode size from image headers:
  //    A pragmatic approach: create a tiny SVG that embeds the image and use resvg to get the image size via naturalWidth/height is not trivial.
  // For simplicity: assume caller's bgImg is fully known size. If not, you can add width/height to params.
  // To remain compatible with your previous code, require bg image size provided via params? 
  // But we will attempt a lightweight way: use an <svg> that relies on image width/height via preserveAspectRatio and let resvg render using fitTo original.
  // Build text svg independent and then wrap.

  // If you have known width/height you should pass them. For now, let's render with a fixed canvas:
  // NOTE: Better approach: caller should pass width/height. If not available, use a fallback (1024x768).
  const fallbackWidth = 1024;
  const fallbackHeight = 768;

  // We can't easily read intrinsic image size without decoding image bytes; simplest is to decode PNG/JPEG headers.
  // Here's a helper that tries to detect PNG/JPEG dimension quickly (works for common cases).
  function detectImageSizeFromBuffer(ab: ArrayBuffer | SharedArrayBuffer): { width: number; height: number } | null {

    const u8 = new Uint8Array(ab);
    // PNG: bytes 16-23 are width/height big-endian
    if (u8[0] === 0x89 && u8[1] === 0x50 && u8[2] === 0x4e && u8[3] === 0x47) {
      const view = new DataView(ab);
      const width = view.getUint32(16, false);
      const height = view.getUint32(20, false);
      return { width, height };
    }
    // JPEG: search for 0xFFC0 / 0xFFC2 marker
    if (u8[0] === 0xff && u8[1] === 0xd8) {
      let offset = 2;
      while (offset < u8.length) {
        if (u8[offset] !== 0xff) break;
        const marker = u8[offset + 1];
        const len = (u8[offset + 2] << 8) + u8[offset + 3];
        if (marker === 0xc0 || marker === 0xc2) {
          const view = new DataView(ab, offset + 5, 4);
          const height = view.getUint16(0, false);
          const width = view.getUint16(2, false);
          return { width, height };
        }
        offset += 2 + len;
      }
    }
    return null;
  }

  // If bgImg was Buffer or fetched above as ArrayBuffer, we can detect size:
  let detectedSize = null;
  if (Buffer.isBuffer(bgImg)) {
    detectedSize = detectImageSizeFromBuffer((bgImg as Buffer).buffer.slice((bgImg as Buffer).byteOffset, (bgImg as Buffer).byteOffset + (bgImg as Buffer).byteLength));
  } else if (typeof bgImg === "string" && !bgImg.startsWith("data:")) {
    // we already fetched 'resp' above, but scope doesn't keep it. For robust code, fetch again and detect
    const resp2 = await fetch(bgImg);
    const ab2 = await resp2.arrayBuffer();
    detectedSize = detectImageSizeFromBuffer(ab2);
  }

  const width = detectedSize?.width ?? fallbackWidth;
  const height = detectedSize?.height ?? fallbackHeight;

  const parsed = parseStyledText(text);
  const textSvg = createTextSvg(parsed, {
    fontSize,
    fontFamily,
    defaultColor,
    lineHeight,
    width,
    height,
    x,
    y,
    rotation,
  });

  const finalSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <image href="${bgDataUrl}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" />
      ${textSvg}
    </svg>
  `;

  const resvg = new Resvg(finalSvg, { fitTo: { mode: "original" } });
  const pngData = resvg.render().asPng();
  return Buffer.from(pngData);
}
