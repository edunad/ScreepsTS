"use strict";

/*

*/

import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import clear from 'rollup-plugin-clear';
import typescript from '@rollup/plugin-typescript';
import screeps from 'rollup-plugin-screeps';

const isWatching = process.argv.includes('-w') || process.argv.includes('--watch')

export default {
  input: "src/index.ts",

  output: {
    file: ".bin/main.js",
    format: "cjs",
    sourcemap: true
  },

  plugins: [
    clear({
        targets: ['.bin'],
        watch: true,
    }),
    commonjs(),
    resolve({ rootDir: "src" }),
    typescript({tsconfig: "./tsconfig.json", noEmitOnError: isWatching ? false : true }),
    screeps({configFile: "./screeps.json"})
  ]
}