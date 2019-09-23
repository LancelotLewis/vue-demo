module.exports = {
  devServer: {
    disableHostCheck: true,
    proxy: {
      '/static': {
        target: 'http://dagoo.work',
        // target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        // pathRewrite: {
        //   '/agentweb': '',
        // },
      },
    },
  },
  productionSourceMap: false,
  // lintOnSave: true,
};
