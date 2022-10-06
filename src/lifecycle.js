/*
 * @Author: Pan Jingyi
 * @Date: 2022-10-05 10:12:49
 * @LastEditTime: 2022-10-06 14:54:12
 */
import Watcher from './observe/watcher';
import { createElementVNode, createTextVNode } from './vdom/index'
import { patch } from './vdom/patch.js'



export function initLifeCycle(Vue){
  Vue.prototype._update = function(vnode){ //将vnode转换成真实dom
    const vm = this;
    const el = vm.$el;

    //patch既有初始化的功能，又有更新的功能
    vm.$el = patch(el,vnode); //将VNode虚拟节点挂载到el元素上

  }

  Vue.prototype._v = function () { // 创建文本
    return createTextVNode(this,...arguments);
  }
  Vue.prototype._c = function () { // 创建元素
    return createElementVNode(this,...arguments);
  }
  Vue.prototype._s = function (val) {
    if(typeof val !== 'object') return val
    return JSON.stringify(val);
  }
  Vue.prototype._render = function(){
    const vm = this;
    // call: 让with中的this指向vm
    return vm.$options.render.call(vm); //执行render函数拿到虚拟节点
  }
}

//组件的挂载
//挂载可以执行render函数产生虚拟节点 虚拟DOM，根据虚拟DOM产生真实DOM，插入到el元素中 
export function mountComponent(vm,el){
  vm.$el = el;

  // 1.调用render方法产生虚拟节点 虚拟DOM
  // vm._render()

  // 2.根据虚拟DOM产生真实DOM
  // vm._update(vm._render())

  const updatedComponent = () => {
    vm._update(vm._render())
  }
  
  new Watcher(vm, updatedComponent,true) //true用于表示是一个渲染watcher

  // 3.插入到el元素中
}