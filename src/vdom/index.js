/*
 * @Author: Pan Jingyi
 * @Date: 2022-10-05 10:46:26
 * @LastEditTime: 2022-10-06 16:07:43
 */
//_c() 创建文本
export function createTextVNode(vm,text){
  return vnode(vm,undefined,undefined,undefined,undefined,text)
}

//_v() 创建节点
export function createElementVNode(vm, tag, data = {}, ...children){
  if(data == null){
    data = {}
  }
  let key = data.key;
  if(key){ //上面我们已经取出了key，所以可以删掉key
    delete data.key
  }
  return vnode(vm,tag,key,data,children)
}

// 虚拟dom比ast功能更强大，可以增加一些自定义属性
function vnode(vm,tag,key,data,children,text){
  return {
    vm,
    tag,
    key,
    data,
    children,
    text
  }
}

export function isSameVNode(vnode1, vnode2){
  return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key
}