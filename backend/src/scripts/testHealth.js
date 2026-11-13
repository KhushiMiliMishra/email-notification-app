const http = require('http');
const { app, server } = require('../server');

setTimeout(async () => {
  const req = http.get('http://localhost:5000/api/health', (res) => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
      console.log('--- Health Check Response Code:', res.statusCode);
      console.log('--- Response Body:', JSON.parse(data));
      server.close(() => {
        console.log('Server successfully closed after health verification.');
        process.exit(0);
      });
    });
  });

  req.on('error', (err) => {
    console.error('Health check request error:', err.message);
    server.close(() => process.exit(1));
  });
}, 1000);

