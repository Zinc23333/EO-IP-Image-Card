import { getBaseUrl } from "@/lib/utils/utils";

export function onRequest( { request }: { request: EORequest } ) {
  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EO IP Image Card - 项目介绍</title>
    <style>
        :root {
            --primary-color: #4361ee;
            --secondary-color: #3f37c9;
            --accent-color: #4cc9f0;
            --light-color: #f8f9fa;
            --dark-color: #212529;
            --success-color: #4caf50;
            --warning-color: #ff9800;
            --danger-color: #f44336;
            --gray-color: #6c757d;
            --border-radius: 8px;
            --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            --transition: all 0.3s ease;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: var(--dark-color);
            background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        header {
            text-align: center;
            padding: 40px 20px;
            margin-bottom: 30px;
        }

        h1 {
            font-size: 3rem;
            margin-bottom: 15px;
            background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            animation: fadeInDown 1s ease;
        }

        .subtitle {
            font-size: 1.2rem;
            color: var(--gray-color);
            max-width: 700px;
            margin: 0 auto;
            animation: fadeInUp 1s ease;
        }

        .card-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }

        .card {
            background: white;
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow);
            padding: 30px;
            transition: var(--transition);
            animation: fadeIn 0.5s ease;
        }

        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
        }

        .card-header {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
        }

        .icon {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            color: white;
            font-size: 1.5rem;
        }

        .card-title {
            font-size: 1.5rem;
            color: var(--primary-color);
        }

        .card-content {
            color: var(--gray-color);
        }

        .features-list {
            list-style-type: none;
            margin: 20px 0;
        }

        .features-list li {
            padding: 8px 0;
            display: flex;
            align-items: flex-start;
        }

        .features-list li::before {
            content: "✓";
            color: var(--success-color);
            font-weight: bold;
            margin-right: 10px;
        }

        .endpoint {
            background: var(--light-color);
            padding: 15px;
            border-radius: var(--border-radius);
            margin: 15px 0;
            font-family: monospace;
            word-break: break-all;
            border-left: 4px solid var(--primary-color);
        }

        .btn {
            display: inline-block;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            padding: 12px 25px;
            border-radius: var(--border-radius);
            text-decoration: none;
            font-weight: bold;
            transition: var(--transition);
            border: none;
            cursor: pointer;
            margin: 10px 5px;
        }

        .btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }

        .btn-outline {
            background: transparent;
            border: 2px solid var(--primary-color);
            color: var(--primary-color);
        }

        .btn-outline:hover {
            background: var(--primary-color);
            color: white;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }

        th, td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }

        th {
            background-color: var(--light-color);
            font-weight: bold;
        }

        tr:hover {
            background-color: #f5f5f5;
        }

        code {
            background-color: var(--light-color);
            padding: 2px 5px;
            border-radius: 3px;
            font-family: monospace;
        }

        .section-gap {
            margin-bottom: 50px;
        }

        footer {
            text-align: center;
            padding: 30px;
            margin-top: 30px;
            color: var(--gray-color);
            border-top: 1px solid rgba(0, 0, 0, 0.1);
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes fadeInDown {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @media (max-width: 768px) {
            .card-container {
                grid-template-columns: 1fr;
            }
            
            h1 {
                font-size: 2rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>EO IP Image Card</h1>
            <p class="subtitle">一个基于 EdgeOne 平台的 IP 地理位置图片卡片生成器，可将 IP 地理位置信息生成图片卡片</p>
        </header>

        <div class="card-container">
            <div class="card">
                <div class="card-header">
                    <div class="icon">📋</div>
                    <h2 class="card-title">项目概述</h2>
                </div>
                <div class="card-content">                  
                    <ul class="features-list">
                        <li>实时 IP 地理位置查询</li>
                        <li>支持自定义参数</li>
                        <li>Serveless 部署</li>
                    </ul>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <div class="icon">⚡</div>
                    <h2 class="card-title">IP 定位</h2>
                </div>
                <div class="card-content">
                    <ul class="features-list">
                        <li>基于 EdgeOne Pages Edge Functions</li>
                        <li>边缘计算快速响应</li>
                        <li>基于 GeoLite2 数据提供中文地名翻译</li>
                    </ul>                    
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <div class="icon">🔧</div>
                    <h2 class="card-title">图片生成</h2>
                </div>
                <div class="card-content">
                    <ul class="features-list">
                        <li>基于 EdgeOne Pages Node Functions</li>
                        <li>通过 PureImage 实时生成图片(约1~3s)</li>
                        <li>自定义图片文本显示内容</li>
                        <li>支持 GET/POST 请求方式</li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="card section-gap">
            <div class="card-header">
                <div class="icon">🌐</div>
                <h2 class="card-title">IP 地理位置 API</h2>
            </div>
            <div class="card-content">
                <h3>/ - 基础信息接口</h3>
                <div class="endpoint">
                    GET /
                </div>
                <p>返回基础的请求信息，包括用户的地理位置、UUID 和客户端 IP 等原始数据。</p>
                
                <h3>/zh - 完整地理位置页面</h3>
                <div class="endpoint">
                    GET /zh
                </div>
                <p>返回一个完整的 HTML 页面，展示用户的详细地理位置信息，包括：</p>
                <ul class="features-list">
                    <li>UUID</li>
                    <li>客户端 IP</li>
                    <li>地理位置信息（国家、省份、城市、经纬度）</li>
                    <li>运营商信息</li>
                    <li>ASN 信息</li>
                    <li>在地图上显示位置（使用高德地图 API）</li>
                </ul>
                
                <h3>/zh-ip-geo - 简化地理位置信息</h3>
                <div class="endpoint">
                    GET /zh-ip-geo
                </div>
                <p>返回中文格式的地理位置信息（仅地名）。</p>
                
                <h3>/version - 版本信息</h3>
                <div class="endpoint">
                    GET /version
                </div>
                <p>返回当前版本号。</p>
            </div>
        </div>

        <div class="card section-gap">
            <div class="card-header">
                <div class="icon">🎨</div>
                <h2 class="card-title">图片生成 API</h2>
            </div>
            <div class="card-content">
                <h3>/api/generate - 图片生成接口</h3>
                <p>这是核心的图片生成接口，支持两种请求方式：</p>
                
                <h4>POST 请求</h4>
                <div class="endpoint">
                    POST /api/generate<br>
                    Content-Type: multipart/form-data
                </div>
                <p>使用 FormData 格式发送参数：</p>
                <table>
                    <thead>
                        <tr>
                            <th>参数</th>
                            <th>类型</th>
                            <th>必填</th>
                            <th>说明</th>
                            <th>参考值/默认值</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>bgImg</td>
                            <td>String/URL</td>
                            <td>是</td>
                            <td>背景图片 URL</td>
                            <td>${getBaseUrl({request})}/public/assets/bg/test.jpg</td>
                        </tr>
                        <tr>
                            <td>text</td>
                            <td>String</td>
                            <td>是</td>
                            <td>要绘制的文本内容</td>
                            <td>地点: #253ef7{...} \n IP: #1e6a99{...}</td>
                        </tr>
                        <tr>
                            <td>x</td>
                            <td>Integer</td>
                            <td>否</td>
                            <td>文本绘制中心 X 坐标</td>
                            <td>0</td>
                        </tr>
                        <tr>
                            <td>y</td>
                            <td>Integer</td>
                            <td>否</td>
                            <td>文本绘制中心 Y 坐标</td>
                            <td>0</td>
                        </tr>
                        <tr>
                            <td>rotation</td>
                            <td>Float</td>
                            <td>否</td>
                            <td>文本旋转角度</td>
                            <td>0</td>
                        </tr>
                        <tr>
                            <td>fontSize</td>
                            <td>Integer</td>
                            <td>否</td>
                            <td>字体大小</td>
                            <td>50</td>
                        </tr>
                        <tr>
                            <td>fontFamily</td>
                            <td>String/URL</td>
                            <td>否</td>
                            <td>字体文件 URL</td>
                            <td>${getBaseUrl({request})}/public/assets/fonts/HarmonyOS_Sans_SC_Medium.ttf</td>
                        </tr>
                        <tr>
                            <td>defaultColor</td>
                            <td>String</td>
                            <td>否</td>
                            <td>默认文本颜色</td>
                            <td>#000000</td>
                        </tr>
                        <tr>
                            <td>lineHeight</td>
                            <td>Float</td>
                            <td>否</td>
                            <td>行高</td>
                            <td>1.2</td>
                        </tr>
                    </tbody>
                </table>
                
                <h4>GET 请求</h4>
                <div class="endpoint">
                    GET /api/generate?param1=value1&param2=value2...
                </div>
                <p>使用 URL 查询参数传递所有参数，参数与 POST 相同。</p>
                
                <h4>文本格式化语法</h4>
                <p>在 <code>text</code> 参数中，您可以使用以下语法来设置文本样式：</p>
                <ul class="features-list">
                    <li><code>#RRGGBB{文本内容}</code> : 设置特定颜色的文本</li>
                    <li><code>\\n</code> : 换行符</li>
                </ul>
                <p>例如：<code>地点: #253ef7{北京} \n ISP: #55ca16{中国电信}</code></p>
                
                <h3>/img/:template - 快捷图片生成</h3>
                <div class="endpoint">
                    GET /img/test<br>
                </div>
                <p>系统提供了预设的模板，可以直接通过路由生成图片：</p>
                <ul class="features-list">
                    <li><code>/img/test</code> - 测试模板</li>
                </ul>
                <p>这些模板会自动获取访问者的 IP 地理位置信息，并生成相应的图片卡片。</p>
            </div>
        </div>

        <div class="card section-gap" id="api-quick-nav">
            <div class="card-header">
                <div class="icon">🚀</div>
                <h2 class="card-title">API 快速导航</h2>
            </div>
            <div class="card-content">
                <p>以下是常用的 API 接口和页面链接：</p>
                
                <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 15px; margin: 20px 0;">
                    <a href="/" class="btn">基础信息</a>
                    <a href="/zh" class="btn">完整地理位置页面</a>
                    <a href="/zh-ip-geo" class="btn">简化地理位置信息</a>
                    <a href="/img/test" class="btn">测试模板图片</a>
                    <a href="/version" class="btn">版本信息</a>
                </div>
                
            </div>
        </div>

        <footer>
            <p>© 2025 EO IP Image Card. 基于 EdgeOne 平台构建.</p>
            <p>将 IP 地理位置信息转换为精美的可视化图片卡片</p>
        </footer>
    </div>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}