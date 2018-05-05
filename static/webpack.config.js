const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    module: {
	rules: [
	    {
		test: /\.js$/,
		exclude: /(node_modules|bower_components)/,
		use: [ 'babel-loader' ]
	    },
	    {
		test: /\.css$/,
		use: [ 'style-loader', 'css-loader' ]
	    }
	]
    },
    output: {
	path: __dirname + '/dist',
	filename: 'index_bundle.js'
    },
    plugins: [
	new HtmlWebpackPlugin({
	    title: 'D3 and RabbitMQ',
	    template: './src/index.html'
	})
    ],
    devServer: {
	host: '0.0.0.0'
    }
}
