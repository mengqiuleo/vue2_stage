import { isSameVNode } from "./index";

/*
 * @Author: Pan Jingyi
 * @Date: 2022-10-06 14:52:15
 * @LastEditTime: 2022-10-11 09:17:14
 */

//创建元素
export function createElm(vnode){
  let { tag, data, children, text } = vnode;
  if(typeof tag === 'string'){ //如果是标签
    vnode.el = document.createElement(tag); //??? 将真实节点和虚拟节点对应起来
    patchProps(vnode.el, {}, data) //绑定属性
    children.forEach(child => {
      vnode.el.appendChild(createElm(child))
    });
  } else{ //如果是文本
    vnode.el = document.createTextNode(text)
  }
  return vnode.el
}

//对比新旧节点的属性
export function patchProps(el, oldProps = {}, props = {}){ //更新属性
  //老的属性中有，新的没有，要删除老的
  let oldStyles = oldProps.style || {}
  let newStyles = props.style || {} //老的样式中有，新的没有，则删除
  for(let key in oldStyles){
    if(!newStyles[key]){
      el.style[key] = ''
    }
  }
  for(let key in oldProps){ //老的属性中有，新的没有，删除
    if(!props[key]){
      el.removeAttribute(key);
    }
  }
  
  for(let key in props){ //用新的覆盖掉老的
    if(key === 'style'){
      for(let styleName in props.style){
        el.style[styleName] = props.style[styleName]
      }
    }else{
      el.setAttribute(key, props[key]);
    }
  }
}

// patch(el,vnode)
export function patch(oldVNode, vnode){
  const isRealElement = oldVNode.nodeType;
  if(isRealElement){  //初渲染流程
    const elm = oldVNode; //获取真实元素
    const parentElm = elm.parentNode; //拿到父元素
    let newElm = createElm(vnode) //此时元素已经创建好了，属性也绑定了
    parentElm.insertBefore(newElm, elm.nextSibling) //插入新节点
    parentElm.removeChild(elm) //删除老节点

    return newElm
  }else{
    //diff算法
    /**
     * 1.两个节点不是同一个节点，直接删除老的换上新的（没有比对了）
     * 2.两个节点是同一个节点（判断节点的tag和节点的key）比较两个节点的属性是否有差异（复用老的节点，将差异的属性更新）
     * 3.节点比较完毕后就需要比较两个节点的儿子
     */

    return patchVNode(oldVNode, vnode)
    
  }
}

//比较同一级的两个新旧节点
function patchVNode(oldVNode, vnode){
  //两个节点不是同一个节点，直接删除老的换上新的（没有比对了）
  if(!isSameVNode(oldVNode, vnode)){ //tag===tag && key===key
    //用老节点的父亲 进行替换
    let el = createElm(vnode);
    oldVNode.el.parentNode.replaceChild(el, oldVNode.el)
    return el;
  }

  //上面的情况是节点完全不一样，现在是节点一样，先特殊处理文本
  let el = vnode.el = oldVNode.el; //复用老节点的元素
  if(!oldVNode.tag){ //是文本
    if(oldVNode.text !== vnode.text){
      el.textContent = vnode.text; //用新的文本覆盖掉老文本
    }
  }

  //是标签的情况, 我们需要对比标签的属性
  patchProps(el, oldVNode.data, vnode.data)

  //开始比较儿子节点
  let oldChildren = oldVNode.children || [];
  let newChildren = vnode.children || [];
  if(oldChildren.length > 0 && newChildren.length > 0){
    //完整的diff算法，需要比较两个人的儿子
    updateChildren(el, oldChildren, newChildren)
  }else if(newChildren.length > 0){ //没有老的，只有新的
    mountChildren(el, newChildren) //挂载新的儿子
  }else if(oldChildren.length > 0){ //新的没有
    el.innerHTML = ''
  }

  return el;
}

function mountChildren(el, newChildren){
  for(let i=0; i<newChildren.length; i++){
    let child = newChildren[i];
    el.appendChild(createElm(child));
  }
}

//完整的diff算法
function updateChildren(el, oldChildren, newChildren){
  //diff算法只会比较同级的节点
  // vue2采用双指针的算法 ：头指针和尾指针
  //头头，尾尾，头尾，尾头

  let oldStartIndex = 0;
  let oldStartVnode = oldChildren[0];
  let oldEndIndex = oldChildren.length - 1;
  let oldEndVnode = oldChildren[oldEndIndex];

  let newStartIndex = 0;
  let newStartVnode = newChildren[0];
  let newEndIndex = newChildren.length - 1;
  let newEndVnode = newChildren[newEndIndex];

  //针对乱序比对 -> 制作一个映射表
  function makeIndexByKey(children){
    let map = {};
    children.forEach((child,index) => {
      map[child.key] = index;
    })
    return map;
  }
  let map = makeIndexByKey(oldChildren);

  while(oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex){
    //双方有一方头指针，大于尾指针则停止循环
    if(!oldStartVnode){ //出现不存在节点的原因：使用乱序比对，我们将节点进行移动，当前位置赋为undefined，所以出现不存在的情况，如果出现这种情况，那就向前/后继续移动指针就好了
      oldStartVnode = oldChildren[++oldStartIndex]
    }else if(!oldEndVnode){
      oldEndVnode = oldChildren[--oldEndIndex]
    }
    //#头比头
    else if(isSameVNode(oldStartVnode, newStartVnode)){ //如果是同一个节点
      patchVNode(oldStartVnode, newStartVnode); //先比较当前节点的属性和样式，并且递归比较子节点
      oldStartVnode = oldChildren[++oldStartIndex];
      newStartVnode = newChildren[++newStartIndex];
    }
    //#尾比尾
    else if(isSameVNode(oldEndVnode,newEndVnode)){
      patchVNode(oldEndVnode, newEndVnode);
      oldEndVnode = oldChildren[--oldEndIndex];
      newEndVnode = newChildren[--newEndIndex];
    }
    //#尾比头
    else if(isSameVNode(oldEndVnode, newStartVnode)){
      patchVNode(oldEndVnode, newStartVnode);
      //insertBefore具备移动性，会将原来的元素移动走
      el.insertBefore(oldEndVnode.el, oldStartVnode.el); //将老的尾移动到老的开头
      oldEndVnode = oldChildren[--oldEndIndex]; //老的尾指针向前移动
      newStartVnode = newChildren[++newStartIndex]; //新的头向后移动
    }
    //#头比尾(全部都是旧结点比新节点)
    else if(isSameVNode(oldStartVnode, newEndVnode)){
      patchVNode(oldStartVnode, newEndVnode);
      el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling); //将老的头移动到老的尾
      oldStartVnode = oldChildren[++oldStartIndex];
      newEndVnode = newChildren[--newEndIndex];
    }
    //#乱序比对
    else {
      // 根据老的列表做一个映射关系，用新的去找，找到则移动，找不到则添加，最后多余的删除
      let moveIndex = map[newStartVnode.key];//如果拿到则说明是我要移动的索引(新旧节点都有，移动即可)
      if(moveIndex !== undefined){
        let moveVnode = oldChildren[moveIndex]; //找到对应的旧结点 -> 复用
        el.insertBefore(moveVnode.el, oldStartVnode.el); //将要移动的节点插入到旧开始结点的前面！！！
        oldChildren[moveIndex] = undefined; //表示这个节点已经被移动走了
        patchVNode(moveVnode, newStartVnode); //对比属性和子节点
      }else {//如果找不到要移动的节点，那就根据新开始节点创造出一个节点，然后插入到旧开始节点的前面
        el.insertBefore(createElm(newStartVnode), oldStartVnode.el);
      }
      newStartVnode = newChildren[++newStartIndex]; //新开始节点向后移动
    }
    
  }
  if(newStartIndex <= newEndIndex){ //如果新dom的节点长度大于旧结点，那就将新节点的多余部分插入
    for(let i=newStartIndex; i<= newEndIndex; i++){
      let childEl = createElm(newChildren[i]);
      //这里不仅要适用于头比头，也要适用于尾比尾
      //头比头：在后面继续追加，尾比尾：在前面插入
      let anchor = newChildren[newEndIndex+1] ? newChildren[newEndIndex+1].el : null; 
      //anchor是一个参照物：判断新节点的尾指针的下一个是否有值，如果有值，证明是尾比尾，是在前面插入，如果没有值，那证明是头比头，要在后面继续插入
      el.insertBefore(childEl, anchor);
      // el.appendChild(childEl);
    }
  }
  if(oldStartIndex <= oldEndIndex){ //如果新dom的节点长度小于旧结点，那就将旧节点的多余部分删除
    for(let i=oldStartIndex; i<= oldEndIndex; i++){
      if(oldChildren[i]){ //这部分的逻辑也适用于乱序比对
        let childEl = oldChildren[i].el;
        el.removeChild(childEl);
      }
    }
  }

  console.log(oldStartVnode,newStartVnode)
}