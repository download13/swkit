import fs from 'fs';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';


const pkg = JSON.parse(fs.readFileSync('./package.json'));

export default {
  entry: 'src/index.js',
  dest: 'dist/index.js',
  format: 'iife',
  moduleName: 'swkit',
  plugins: [
    resolve({
      jsnext: true,
      main: true,
      browser: true
    }),
    commonjs()
  ]
};
