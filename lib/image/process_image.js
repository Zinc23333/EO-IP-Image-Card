// generate_image_with_text.js
const PImage = require("pureimage");
const { Readable, PassThrough } = require("stream");
const { loadFontFromUrl } = require('../utils/fetch_font_and_register');


/**
 * Helper: buffer -> readable stream
 */
function bufferToStream(buffer) {
  const s = new Readable();
  s.push(buffer);
  s.push(null);
  return s;
}

/**
 * Helper: encode canvas to JPEG buffer (uses encodeJPEGToStream)
 */
function encodeCanvasToJpegBuffer(canvas, quality = 90) {
  return new Promise((resolve, reject) => {
    // pureimage's encodeJPEGToStream accepts (canvas, stream, quality)
    const outStream = new PassThrough();
    const chunks = [];
    outStream.on("data", (c) => chunks.push(c));
    outStream.on("end", () => resolve(Buffer.concat(chunks)));
    outStream.on("error", (e) => reject(e));

    try {
      PImage.encodeJPEGToStream(canvas, outStream, quality).then(() => {
        outStream.end();
      }).catch(reject);
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * 解析带颜色标记/换行的文本
 * e.g. "你好 #ff0000{世界}\n下一行"
 */
function parseStyledText(text) {
  const segments = [];
  const regex = /(#[0-9a-fA-F]{6})\{(.+?)\}|(\n)|([^#\n]+)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match[1] && match[2]) {
      segments.push({ type: "text", content: match[2], color: match[1] });
    } else if (match[3]) {
      segments.push({ type: "newline" });
    } else if (match[4]) {
      segments.push({ type: "text", content: match[4], color: null });
    }
  }
  return segments;
}

/**
 * 渲染解析后的片段到 pureimage ctx
 * 参数说明与原始 TS 版本一致
 */
function renderTextToCtx(ctx, segments, opts) {
  const {
    fontSize,
    fontFamily,
    defaultColor,
    lineHeight,
    x,
    y,
    rotation,
    imageWidth,
    imageHeight,
  } = opts;

  // 设置字体（pureimage 使用类似 "24pt 'FontName'"）
  ctx.font = `${fontSize}pt "fontFamilyName"`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // 分行
  const lines = [];
  let cur = [];
  for (const seg of segments) {
    if (seg.type === "newline") {
      lines.push(cur);
      cur = [];
    } else {
      cur.push(seg);
    }
  }
  lines.push(cur);

  const lineCount = lines.length;
  const lineHeightPx = fontSize * lineHeight;
  const totalHeight = (lineCount - 1) * lineHeightPx;
  // 文字块顶部起点
  let cursorYStart = y - totalHeight / 2;

  // 旋转整个文字块：将坐标系移动到 (x,y), 旋转, 再移回来
  ctx.translate(x, y);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-x, -y);

  // 绘制每行
  let cursorY = cursorYStart;
  for (const line of lines) {
    // 计算整行纯文本宽度（逐段测量）
    let lineText = line.map(s => s.content).join("");
    // measureText 在 pureimage 返回 { width }
    const lineWidth = ctx.measureText(lineText).width;

    // 从行左侧开始绘制，每段按测量宽度依次绘制
    // 我们需要以 center 对齐，所以起始 x (left) = x - lineWidth/2
    let offsetX = x - lineWidth / 2;

    for (const seg of line) {
      const segWidth = ctx.measureText(seg.content).width;
      const cx = offsetX + segWidth / 2; // center position for this segment
      ctx.fillStyle = seg.color || defaultColor;
      ctx.fillText(seg.content, cx, cursorY);
      offsetX += segWidth;
    }

    cursorY += lineHeightPx;
  }

  // 恢复变换（注意：pureimage CanvasRenderingContext2D 没有 save/restore?）
  // 为安全起见，反向变换
  ctx.translate(x, y);
  ctx.rotate((-rotation * Math.PI) / 180);
  ctx.translate(-x, -y);
}

/**
 * 主函数（暴露）：在背景图上绘制文本并返回 Buffer（JPEG）
 * bgImg: Buffer 或 path string（如果是 path string，会作为 binary string 处理）
 */
async function generateImageWithText(params) {
  const {
    bgImg,
    text,
    x,
    y,
    rotation = 0,
    fontSize = 50,
    fontFamily = "/public/assets/fonts/HarmonyOS_Sans_SC_Medium.ttf",
    defaultColor = "#000000",
    lineHeight = 1.2,
  } = params;

  await loadFontFromUrl(fontFamily, "fontFamilyName");

  try {
    // 1) 解码背景图（先尝试 JPEG，再尝试 PNG）
    let bgBuffer;
    if (Buffer.isBuffer(bgImg)) {
      bgBuffer = bgImg;
    } else if (typeof bgImg === "string") {
      // treat as base64 or binary string? We'll assume it's a binary string buffer.
      bgBuffer = Buffer.from(bgImg, "binary");
    } else {
      throw new Error("bgImg must be Buffer or string");
    }

    let bg;
    let lastErr;
    try {
      const stream = bufferToStream(bgBuffer);
      bg = await PImage.decodeJPEGFromStream(stream);
    } catch (e) {
      lastErr = e;
      try {
        const stream2 = bufferToStream(bgBuffer);
        bg = await PImage.decodePNGFromStream(stream2);
      } catch (e2) {
        lastErr = e2;
        throw new Error("无法解析背景图片（既不是 JPEG 也不是 PNG）: " + lastErr.message);
      }
    }

    const imgWidth = bg.width;
    const imgHeight = bg.height;

    // 2) 创建画布并绘制背景
    const canvas = PImage.make(imgWidth, imgHeight);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(bg, 0, 0);

    // 3) 解析文本并绘制
    const segments = parseStyledText(text);

    // 注意：如果你使用自定义字体，请在调用此函数前用 PImage.registerFont(...) 注册并 loadSync()

    renderTextToCtx(ctx, segments, {
      fontSize,
      fontFamily,
      defaultColor,
      lineHeight,
      x,
      y,
      rotation,
      imageWidth: imgWidth,
      imageHeight: imgHeight,
    });

    // 4) 输出 JPEG buffer
    const outBuf = await encodeCanvasToJpegBuffer(canvas, 90);
    return outBuf;
  } catch (err) {
    console.error("生成图片时发生错误:", err);
    throw err;
  }
}

module.exports = {
  generateImageWithText,
};
