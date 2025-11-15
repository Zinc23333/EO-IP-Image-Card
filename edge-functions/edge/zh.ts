export function onRequest({ request }: { request: EORequest }) {
  const eo = request.eo;
  const { geo, uuid, clientIp } = eo;

  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IP位置</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f7fa;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
            color: white;
            padding: 20px;
            text-align: center;
        }
        .content {
            padding: 20px;
        }
        .info-panel {
            padding: 20px 0;
        }
        .map-panel {
            width: 100%;
            height: 400px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-top: 20px;
        }
        .data-section {
            margin-bottom: 20px;
        }
        .section-title {
            font-size: 1.4em;
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 8px;
            margin-top: 20px;
        }
        .info-row {
            display: flex;
            padding: 10px 0;
            border-bottom: 1px dashed #eee;
        }
        .info-label {
            min-width: 150px;
            font-weight: bold;
            color: #7f8c8d;
        }
        .info-value {
            flex: 1;
            color: #2c3e50;
        }
        .geo-section {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>IP位置</h1>
        </div>
        <div class="content">
            <div class="info-panel">
                <div class="data-section">
                    <div class="section-title">基础信息</div>
                    <div class="info-row">
                        <div class="info-label">UUID</div>
                        <div class="info-value">${uuid}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">客户端IP</div>
                        <div class="info-value">${clientIp}</div>
                    </div>
                </div>

                <div class="data-section">
                    <div class="section-title">地理位置信息</div>
                    <div class="geo-section">
                        <div class="info-row">
                            <div class="info-label">国家</div>
                            <div class="info-value">${geo.countryName} (${geo.countryCodeAlpha2}/${geo.countryCodeNumeric})</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">省份</div>
                            <div class="info-value">${geo.regionName} (${geo.regionCode})</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">城市</div>
                            <div class="info-value">${geo.cityName}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">坐标</div>
                            <div class="info-value">北纬 ${geo.latitude}°\n东经 ${geo.longitude}°</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">运营商</div>
                            <div class="info-value">${geo.cisp}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">ASN</div>
                            <div class="info-value">${geo.asn}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="map-panel" id="mapContainer"></div>
        </div>
    </div>

    <script type="text/javascript" src="https://webapi.amap.com/maps?v=1.4.15"></script>
    <script>
        // 坐标转换函数
        function initMapWithCoordinateConversion() {
            // 将WGS84坐标转换为高德地图使用的GCJ02坐标
            AMap.convertFrom([${geo.longitude}, ${geo.latitude}], 'gps', function(status, result) {
                var mapCenter, markerPosition;
                
                if (status === 'complete' && result.info === 'ok') {
                    // 转换成功，使用转换后的坐标
                    mapCenter = [result.locations[0].lng, result.locations[0].lat];
                    markerPosition = [result.locations[0].lng, result.locations[0].lat];
                } else {
                    // 转换失败，使用原始坐标（可能会有偏差）
                    mapCenter = [${geo.longitude}, ${geo.latitude}];
                    markerPosition = [${geo.longitude}, ${geo.latitude}];
                }
                
                // 初始化地图
                var map = new AMap.Map('mapContainer', {
                    zoom: 12,
                    center: mapCenter
                });

                // 添加标记点
                var marker = new AMap.Marker({
                    position: markerPosition,
                    title: '客户端位置 - ${geo.cityName}',
                    label: {
                        content: '客户端IP: ${clientIp}',
                        offset: new AMap.Pixel(0, -20)
                    }
                });
                map.add(marker);

                // 添加信息窗体
                var infoWindow = new AMap.InfoWindow({
                    content: \`
                        <div style="padding: 10px;">
                            <h3 style="margin: 0 0 10px 0; color: #2c3e50;">位置详情</h3>
                            <p><strong>城市:</strong> ${geo.cityName}</p>
                            <p><strong>省份:</strong> ${geo.regionName}</p>
                            <p><strong>国家:</strong> ${geo.countryName}</p>
                            <p><strong>坐标:</strong> \${markerPosition[0]}, \${markerPosition[1]}</p>
                            <p><strong>运营商:</strong> ${geo.cisp}</p>
                        </div>
                    \`,
                    offset: new AMap.Pixel(0, -30)
                });

                // 点击标记显示信息窗体
                marker.on('click', function() {
                    infoWindow.open(map, marker.getPosition());
                });
            });
        }
        
        // 页面加载完成后初始化地图
        window.onload = function() {
            initMapWithCoordinateConversion();
        };
    </script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}



