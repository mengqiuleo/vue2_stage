/*
 * @Author: Pan Jingyi
 * @Date: 2022-10-04 14:36:30
 * @LastEditTime: 2022-10-10 20:50:30
 */
import { compileToFunction } from './compiler/index';
import { initMixin } from './init'
import { initLifeCycle } from './lifecycle'
import { initStateMixin } from './state'
import { createElm, patch } from './vdom/patch';


// 将所有方法都耦合在一起
function Vue(options) { //options就是用户的选项
  this._init(options)
}


initMixin(Vue); //扩展了init方法
initLifeCycle(Vue); //vm_update vm._render
initStateMixin(Vue); //实现了nextTick $watcher

// diff的测试代码
let render1 = compileToFunction(`<ul key='a' a='1' style='color:red'>
  <li key='a'>a</li>
  <li key='b'>b</li>
  <li key='c'>c</li>
</ul>`)
let vm1 = new Vue({data: { name: 'zf' }})
let prevVNode = render1.call(vm1)

let el = createElm(prevVNode)
document.body.appendChild(el)


let render2 = compileToFunction(`<ul key='a' a='1' style='color:red'>
  <li key='d'>d</li>
  <li key='a'>a</li>
  <li key='b'>b</li>
  <li key='c'>c</li>
</ul>`)
let vm2 = new Vue({data: { name: 'zf' }})
let nextVNode = render2.call(vm2)

console.log(prevVNode, nextVNode)

setTimeout(() => {
  patch(prevVNode, nextVNode) //patch中实现diff算法
  //原来的做法：直接将新的节点替换掉老的
  // let newEl = createEle(nextVNode)
  // el.parentNode.replaceChild(newEl, el)
}, 1000);

export default Vue


