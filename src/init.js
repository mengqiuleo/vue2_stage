/*
 * @Author: Pan Jingyi
 * @Date: 2022-10-04 15:16:44
 * @LastEditTime: 2023-01-03 03:48:06
 */
import { initState } from './state'
import { compileToFunction } from './compiler/index'
import { mountComponent } from './lifecycle'
import { mergeOptions } from './utils';

export function initMixin(Vue) { //就是给Vue增加init方法的
  Vue.prototype._init = function(options){ //用于初始化话操作
    // vm.$options 就是获取用户的配置

    const vm = this;
    //vm.$options = options; //将用户的选项挂载到实例上
    vm.$options = mergeOptions(this.constructor.options, options) //实现mixin功能

    //初始化状态：就是挂载属性，方法，计算属性...
    initState(vm);

    if(options.el){
      vm.$mount(options.el); //实现数据的挂载
    }
  }

  Vue.prototype.$mount = function(el) {
    const vm = this;
    el = document.querySelector(el);
    let ops = vm.$options;

    //优先级：render > template > el
    //如果没有render
    if(!ops.render) { //先进行查找有没有render函数
      let template; //没有render查看是否写了template，没有写template就用外部的template
      if(!ops.template && el) { //没有写模板，但是写了 el
        template = el.outerHTML;
      }else { //如果没模板
        if(el) { //如果有el,采用模板的内容
          template = ops.template;
        }
      }
      //现在有了template，就用写了的template
      if(template && el){
        //这里需要对模板进行编译
        const render = compileToFunction(template); //根据template生成一个render函数
        ops.render = render; //挂载render属性
      }
    }

    mountComponent(vm, el); //组件的挂载
    //有render就直接获取，我们最终都是要拿到一个render函数
    ops.render; //最终就可以获取render方法 -> 获取：vm.$options.render
    // 后续每次数据更新可以只执行render函数无需调用ast转换的过程
  }
}

