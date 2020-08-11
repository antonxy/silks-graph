import resolve from "rollup-plugin-node-resolve";
import commonjs from 'rollup-plugin-commonjs';

export default {
	input: "src/app.js",
	output: {
		format: "umd",
		name: "app",
		file: "src/bundle.js"
	},
	plugins: [
		resolve(),
		commonjs()
	],
};
