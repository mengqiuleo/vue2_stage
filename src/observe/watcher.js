/*
 * @Author: Pan Jingyi
 * @Date: 2022-10-05 21:09:03
 * @LastEditTime: 2022-10-06 18:55:27
 */
/**
 * 观察者模式
 * 我们可以给模板中的属性 增加一个收集器dep
 * 页面渲染的时候 我们将渲染逻辑封装到watcher中 vm._update(vm.render())
 * 让dep记住这个watcher即可，稍后属性变化了可以找到对应的dep中存放的watcher进行重新渲染
 * 
 * 每个属性有一个dep(属性就是被观察者)，watcher就是观察者（属性变化了会通知观察者来更新）
 */

import Dep, { popTarget, pushTarget } from "./dep";

/**
 * 每一个组件都有一个watcher，watcher中放了一个组件中的很多属性dep，并且我们给每个组件赋一个id标识
 * 每一个属性有一个dep属性，里面存放了这个属性的watcher，可能一个属性的dep中存放了很多个watcher，因为这个属性在很多地方都用到了
 * 当这个组件的属性没有被渲染时，dep和watcher是不会被收集的
 */
let id = 0;

class Watcher {
  constructor(vm, fn, options){
    this.id = id++;
    this.renderWatcher = options; //true表示是一个渲染watcher（因为计算属性也有watcher，那是一个计算watcher）
    this.getter = fn; //getter意味着调用这个函数可以发生取值操作
    this.deps = []; //存放该组件watcher的dep数组
    this.depsId = new Set(); //对dep进行去重，只收集一次某个dep
    this.lazy = options.lazy; //针对计算属性
    this.dirty = this.dirty; //针对计算属性，看是否是脏值
    this.lazy ? undefined : this.get(); //初次渲染先调用一次： 使 vm._update(vm._render()) 执行
    //但是首先要判断是否是计算属性，如果不是，就是初次渲染先调用一次
  }
  addDep(dep){ //让当前watcher收集它的dep
    let id = dep.id; //拿到该dep的id
    if(!this.depsId.has(id)){ //如果一个属性在视图上进行多次渲染，但是只需要收集一次
      this.deps.push(dep);
      this.depsId.add(id);
      dep.addSub(this); //让dep记住watcher
    }
  }
  get(){
    pushTarget(this); //在执行watcher之前，将当前dep增加一个当前watcher，这样我们就将当前dep和watcher连接起来了
    //当我们创建渲染watcher的时候，我们会把当前的渲染watcher放到Dep.target上
    this.getter(); //会去vm上取值，此时就调用了vm._update(vm._render())，当调用该render函数时，我们就会走到数据劫持的get()上
    popTarget(); //当当前组件渲染完毕后，我们就将target清空
  }
  update(){ //我们需要实现异步更新：即多次修改值只会最终执行一次视图更新
    //实现方案：使用异步更新 -> 事件环
    // this.get(); //重新渲染
    queueWatcher(this); //把当前的watcher暂存起来
  }
  run(){
    // console.log('更新视图只执行一次')
    this.get(); //重新渲染
  }
}

let queue = [];
let has = {}; //实现去重
let pending = false; //防抖：多次修改值，只进行一轮刷新
function flushSchedulerQueue(){ //执行所有要进行的更新视图操作
  let flushQueue = queue.slice(0);
  queue = [];
  has = {};
  pending = false
  flushQueue.forEach(q => q.run())
}

function queueWatcher(watcher){
  const id = watcher.id;
  if(!has[id]){
    queue.push(watcher);
    has[id] = true;
    //不管我们的update执行多少次，但是最终只执行一轮刷新操作
    if(!pending){
      //setTimeout(flushSchedulerQueue,0);
      //原来我们是使用setTimeout实现异步更新，但是其实底层我们可以也可以使用promise来实现异步更新
      //vue为了统一，实现了自己的异步更新方法：nextTick
      nextTick(flushSchedulerQueue);
      pending = true;
    }
  }
}

let callbacks = [];
let waiting = false;
function flushCallbacks(){
  waiting = false;
  let cbs = callbacks.slice(0);
  callbacks = []
  cbs.forEach(cb => cb());
}
//nextTick 没有直接使用某个api 而是采用优雅降级的方式
//内部先采用的是promise（ie不兼容） MutationObserver(h5的api) 可以考虑ie专享的 setImmediate setTimeout
// let timerFunc;
// if (Promise) { // then方法是异步的
//   timerFunc = () => {
//       Promise.resolve().then(flushCallbacks)
//   }
// }else if (MutationObserver) { // MutationObserver 也是一个异步方法
//   let observe = new MutationObserver(flushCallbacks); // H5的api
//   let textNode = document.createTextNode(1);
//   observe.observe(textNode, {
//       characterData: true
//   });
//   timerFunc = () => {
//       textNode.textContent = 2;
//   }
// }else if (setImmediate) {
//   timerFunc = () => {
//       setImmediate(flushCallbacks)
//   }
// }else{
//   timerFunc = () => {
//       setTimeout(flushCallbacks, 0);
//   }
// }

export function nextTick(cb){ //会先调用户写的nextTick还是内部的nextTick？？ 不一定，谁放在前面就先执行谁
  callbacks.push(cb);
  if(!waiting){
    // timerFunc();
    Promise.resolve().then(flushCallbacks)
    waiting = true;
  }
}

export default Watcher