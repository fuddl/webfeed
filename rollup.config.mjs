// rollup.config.js
export default {
  input: './app/content.js',
  output: {
    file: 'app/content-combined.js',
    format: 'esm',
  },
  watch: {
    include: 'app/**/*.mjs'
  }
}
