export default {
  entries: ["./index"],
  clean: true,
  rollup: {
    esbuild: {
      minify: false,
    },
  },
}
