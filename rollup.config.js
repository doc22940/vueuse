// rollup.config.js
import typescript from '@rollup/plugin-typescript'
import { uglify } from 'rollup-plugin-uglify'
import dts from 'rollup-plugin-dts'
const packages = require('./scripts/packages')

const configs = []

for (const [pkg, options] of packages) {
  const globals = {
    vue: 'Vue',
    '@vue/composition-api': 'vueCompositionApi',
    '@vue/runtime-dom': 'Vue',
    ...(options.globals || {}),
  }
  const name = 'VueUse'

  configs.push({
    input: `packages/${pkg}/index.ts`,
    output: [
      {
        file: `dist/${pkg}/index.cjs.js`,
        format: 'cjs',
      },
      {
        file: `dist/${pkg}/index.esm.js`,
        format: 'es',
      },
      {
        file: `dist/${pkg}/index.umd.js`,
        format: 'umd',
        name,
        globals,
      },
      {
        file: `dist/${pkg}/index.umd.min.js`,
        format: 'umd',
        name,
        globals,
        plugins: [
          uglify(),
        ],
      },
    ],
    plugins: [
      typescript(),
    ],
    external: [
      'vue',
      '@vue/composition-api',
      '@vue/runtime-dom',
      ...(options.external || []),
    ],
  })

  configs.push({
    input: `./typings/${pkg}/index.d.ts`,
    output: {
      file: `dist/${pkg}/index.d.ts`,
      format: 'es',
    },
    plugins: [
      dts(),
    ],
  })
}

export default configs
