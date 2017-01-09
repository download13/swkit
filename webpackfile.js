module.exports = [
	{
		entry: './src/index.js',
		output: {
			path: './dist',
			filename: 'index.js',
			library: 'swkit',
			libraryTarget: 'umd'
		},
		module: {
			loaders: [
				{
					test: /\.js$/,
					exclude: /node_modules/,
					loader: 'babel-loader',
					query: {
						presets: [
							['babel-preset-es2015', {modules: false}]
						]
					}
				}
			]
		}
	}
];
