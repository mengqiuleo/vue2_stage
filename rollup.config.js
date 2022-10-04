/*
 * @Author: Pan Jingyi
 * @Date: 2022-10-04 14:36:30
 * @LastEditTime: 2022-10-04 14:48:11
 */
// rollup默认可以导出一个对象，作为打包的配置文件
import babel from 'rollup-plugin-babel'
export default {
  input: './src/index.js', //入口
  output: {
    file: './dist/vue.js', //出口
    name: 'Vue', //global.vue
    format: 'umd', //esm es6模块 common.js模块 iife 自执行函数 umd(commonjs amd)
    sourcemap: true, //希望可以调试源代码
  },
  plugins: [
    babel({
      exclude: 'node_modules/**' //排除node_modules所有文件
    })
  ]
}