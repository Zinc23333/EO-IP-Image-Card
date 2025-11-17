# EO IP Image Card

一个基于 EdgeOne 平台的 IP 地理位置图片卡片生成器，可将 IP 地理位置信息生成图片卡片。

[Preview](http://ip.zinc233.top/img/test)
![Preview](https://ip.zinc233.top/img/test)


## 功能特性

- 实时 IP 地理位置查询
- 支持自定义参数的图片生成
- 基于 Serverless 架构部署
- 中文地名显示
- 可视化地理位置信息展示

## 技术架构

该项目分为两个主要部分：

1. **Edge Functions** - 处理 IP 地理位置查询
2. **Node Functions** - 处理图片生成服务

### Edge Functions

- `/` - 基础信息接口，返回用户的地理位置、UUID 和客户端 IP 等原始数据
- `/zh` - 完整地理位置页面，以 HTML 形式展示详细地理位置信息
- `/zh-ip-geo` - 简化地理位置信息，返回中文格式的地名
- `/version` - 返回当前版本号

### Node Functions

- `/api/generate` - 图片生成接口，支持 GET 和 POST 两种请求方式
- `/img/:template` - 快捷图片生成模板

## 部署

该项目专为 EdgeOne 平台设计，需要部署到 EdgeOne Pages 服务。

1. 克隆此仓库
2. 在 EdgeOne 控制台创建新的 Pages 项目
3. 连接您的 Git 仓库
4. 配置构建设置并部署

## 使用方法

### 获取 IP 地理位置信息

访问以下端点获取 IP 地理位置信息：
- `GET /` - 基础信息
- `GET /zh` - 完整地理位置页面
- `GET /zh-ip-geo` - 简化地理位置信息

### 生成地理位置图片

使用 `/api/generate` 端点生成图片：

#### POST 请求
```bash
curl -X POST /api/generate \
  -F "bgImg=https://ip.zinc233.top/public/assets/bg/test.jpg" \
  -F "text=地点: #253ef7{北京} \n ISP: #55ca16{中国电信}" \
  -F "fontSize=50" \
  -F "x=0" \
  -F "y=0" \
  -F "fontFamily=https://ip.zinc233.top/public/assets/fonts/HarmonyOS_Sans_SC_Medium.ttf"
```

#### GET 请求
```bash
curl "https://ip.zinc233.top/api/generate?bgImg=...&text=...&fontSize=50&x=0&y=0&fontFamily=..."
```

### 快捷模板

使用 `/img/test` 端点直接生成预设模板的地理位置图片卡片。

## 开发

安装依赖：
```bash
npm install
```

本地开发需要 EdgeOne 提供的开发工具支持。

### 增加新模板
1. 在 [public/assets/bg](public/assets/bg) 增加图片
2. 在 [lib/image/image_config.ts](lib/image/image_config.ts) 第51行附近，添加图片配置信息

## 许可证

MIT