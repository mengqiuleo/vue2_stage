/*
 * @Author: Pan Jingyi
 * @Date: 2022-10-04 15:28:08
 * @LastEditTime: 2022-10-10 20:16:21
 */
import { observe } from './observe/index'
import Watcher, { nextTick } from './observe/watcher';

export function initState(vm){
  const opts = vm.$options; //获取所有选项
  if(opts.data) {
    initData(vm);
  }
  if(opts.computed){
    initComputed(vm);
  }
}

//将 vm._data 用 vm 来代理
function proxy(vm, target, key){
  Object.defineProperty(vm, key, {
    get(){
      return vm[target][key];
    },
    set(newValue){
      vm[target][key] = newValue
    }
  })
}

function initData(vm){
  let data = vm.$options.data; //data可能是函数或者对象
  // 这里我们只是拿到了用户的数据，但是得把数据绑定到vm上，如何绑定呢？用 _data
  data = typeof data === 'function' ? data.call(vm) : data; //data是用户返回的对象

  vm._data = data //我将返回的对象放到了_data上
  //现在已经成功绑定了，但是访问不太方便：vm._data.name
  //怎么变方便呢？ -> 将 vm._data 用 vm 来代理

  // 接下来是对数据进行劫持 vue2里采用了一个api defineProperty
  observe(data)

  //将 vm._data 用 vm 来代理
  for(let key in data){
    proxy(vm, '_data', key);
  }
}

/**
 * 计算属性 依赖的值发生变化才会重新执行用户的方法，计算属性中要维护一个dirty属性，默认计算属性不会立即执行
 * 计算属性就是一个defineProperty
 * 计算属性也是一个watcher，默认渲染会创造一个渲染watcher
 */
function initComputed(vm){
  const computed = vm.$options.computed;
  const watchers = vm._computedWatchers = {} //将计算属性watcher保存到vm上
  // console.log(computed)
  for(let key in computed){
    let userDef = computed[key]; //拿到每一个计算属性
    
    //我们需要监控 计算属性中get的变化
    let fn = typeof userDef === 'function' ? userDef : userDef.get;

    //如果直接 new Watcher 默认就会执行fn, 
    // key是那个计算属性，我们让这个计算属性记住自己的watcher
    watchers[key] = new Watcher(vm, fn, {lazy:true}) //lazy:true: 如果不取值，就不用执行watcher



    //将getter和setter进行数据劫持
    defineComputed(vm, key, userDef); //key是那个计算属性

  }
}
function defineComputed(target, key, userDef){
  //拿到对应的getter和setter
  const getter = typeof userDef === 'function' ? userDef : userDef.get;
  const setter = userDef.set || (() => {});

  //可以通过实例拿到setter和getter属性
  Object.defineProperty(target, key, {
    get:createComputedGetter(key),
    set:setter
  })
}
function createComputedGetter(key){
  //我们需要监测是否要执行这个getter
  return function(){
    const watcher = this._computedWatchers[key]//获取到对应属性的watcher
    if(watcher.dirty){
      //如果是脏的就去执行 用户传入的函数
      watcher.evaluate()
    }
    return watcher.value;
  }
}

export function initStateMixin(Vue){
  Vue.prototype.$nextTick = nextTick
}