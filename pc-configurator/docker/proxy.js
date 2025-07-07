const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const API_TARGET = 'http://localhost:3001'; // JSON-server correrá en otro puerto

// Proxy para /components/:category y /components/:category/:id

// Debug log para ver rutas entrantes
app.use((req, res, next) => {
  console.log('Incoming:', req.method, req.originalUrl);
  next();
});


// Proxy solo para peticiones GET
app.get(/^\/components\/([^\/]+)\/([^\/]+)$/, (req, res, next) => {
  const category = req.params[0];
  const id = req.params[1];
  req.url = `/${category}/${id}`;
  console.log('Proxying to:', req.url);
  next();
});

app.get(/^\/components\/([^\/]+)$/, (req, res, next) => {
  const category = req.params[0];
  req.url = `/${category}`;
  console.log('Proxying to:', req.url);
  next();
});


// Redirige todo a JSON-server
app.use(
  '/',
  createProxyMiddleware({
    target: API_TARGET,
    changeOrigin: true,
    ws: true,
    logLevel: 'info',
  })
);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Express proxy listening on port ${PORT}`);
  console.log(`Proxying API requests to ${API_TARGET}`);
});
