import resolve from "rollup-plugin-node-resolve";
import commonjs from 'rollup-plugin-commonjs';
import copy from 'rollup-plugin-copy';

export default {
	input: "src/app.js",
	output: {
		format: "umd",
		name: "app",
		file: "src/bundle.js"
	},
	plugins: [
		resolve(),
		commonjs(),
		copy({
			targets: [
				{ src: 'node_modules/bootstrap/dist/css/bootstrap-grid.css', dest: 'src/' }
			]
		})
	],
};
