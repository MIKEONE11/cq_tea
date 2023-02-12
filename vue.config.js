let path = require("path")
const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
	transpileDependencies: true,
	lintOnSave: false,  // 修改成false 就是eslint不检查了
	publicPath: './',		
	configureWebpack: (config) => {		
		config.resolve = {
			extensions: ['.js', '.json', '.vue'],
			alias: {
				'@': path.resolve(__dirname, './src')   //将所有./src目录用@表示
			}
		}
	},
	devServer: {
	    host: '192.168.0.100',
	    // https:true,
	    // port: 6103,
	    client: {
	      webSocketURL: 'ws://0.0.0.0:6103/ws',
	    },
	    headers: {
	      'Access-Control-Allow-Origin': '*',
	    },
	},
	devServer: {
		proxy: {
		  '/api': {
			target: 'http://localhost:3000',
			changeOrigin: true
		  }
		}
	}

});
