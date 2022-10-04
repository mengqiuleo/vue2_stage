/*
 * @Author: Pan Jingyi
 * @Date: 2022-10-04 15:28:08
 * @LastEditTime: 2022-10-04 15:59:30
 */
import { observe } from './observe/index'

export function initState(vm){
  const opts = vm.$options; //获取所有选项
  if(opts.data) {
    initData(vm);
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