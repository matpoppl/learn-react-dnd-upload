import babel from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import jsx from 'acorn-jsx';

export default {
	input: "src/react/bootstrap.js",
	acornInjectPlugins: [jsx()],
	output: {
		file: "dist/static/js/app.js",
		format: "iife",
	},
	plugins: [
		//typescript({ compilerOptions: { jsx: 'preserve' } }),
		typescript(),
		
		nodeResolve({ extensions: [".js"], }),

		commonjs(),

		babel({
			babelHelpers: 'bundled',
			presets: [
				"@babel/preset-typescript",
				["@babel/preset-react", {"runtime": "automatic"}]
			],
			plugins: ["transform-node-env-inline"]
		}),
	]
};