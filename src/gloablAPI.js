/*
 * @Author: Pan Jingyi
 * @Date: 2023-01-03 03:42:53
 * @LastEditTime: 2023-01-03 03:48:47
 */

import { mergeOptions } from "./utils"


export function initGlobalAPI(Vue){

  Vue.options = {} //options身上有vue实例的一些属性，这些属性都是一个数组，比如create属性，components属性

  Vue.mixin = function(mixin){
    //合并，产生一个新的对象
    this.options = mergeOptions(this.options, mixin)
    return this
  }
}