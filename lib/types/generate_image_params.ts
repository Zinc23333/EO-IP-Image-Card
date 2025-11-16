// 定义主函数的参数接口
export interface GenerateImageParams {
  bgImg: string | Buffer;
  text: string;
  x: number;
  y: number;
  rotation?: number;
  fontSize?: number;
  fontFamily?: string;
  defaultColor?: string;
  lineHeight?: number;
}
