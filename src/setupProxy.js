const { createProxyMiddleware } = require('http-proxy-middleware');

/** Dev only: evita CORS ao testar share no browser (localhost). APK usa URL direta. */
module.exports = function setupProxy(app) {
  app.use(
    '/transcodificador-api',
    createProxyMiddleware({
      target: 'https://transcodificador.vlibras.gov.br',
      changeOrigin: true,
      secure: true,
      pathRewrite: { '^/transcodificador-api': '/api/v1' },
    })
  );
};
