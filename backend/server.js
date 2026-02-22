const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const stationCollectRouter = require('./api/station-collect');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// 请求日志
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 静态文件托管 - 前端页面
app.use(express.static(path.join(__dirname, '../frontend')));

// 路由
app.use('/api/station-collect', stationCollectRouter);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: err.message
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log('========================================');
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log('========================================');
  console.log(`📄 采集表单: http://localhost:${PORT}/station-collect-form.html`);
  console.log(`📋 站点列表: http://localhost:${PORT}/station-list.html`);
  console.log(`🔌 API 地址: http://localhost:${PORT}/api/station-collect`);
  console.log(`❤️  健康检查: http://localhost:${PORT}/health`);
  console.log('========================================');
});

module.exports = app;
