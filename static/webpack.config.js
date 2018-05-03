const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');

module: {
    rules: [
	{
	    test: /\.js$/,
	    exclude: /(node_modules|bower_components)/,
	    use: {
		loader: 'babel-loader',
		options: {
		    presets: ['@babel/preset-env']
		}
	    }
	}
    ]
}

module.exports = {
    entry: './src/index.js',
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
    mode: 'development'
}
