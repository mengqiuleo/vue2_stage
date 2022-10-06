/*
 * @Author: Pan Jingyi
 * @Date: 2022-10-04 19:50:35
 * @LastEditTime: 2022-10-05 10:10:28
 */

import { parseHTML } from "./parse";

// genProps函数用来解析属性
function genProps(attrs){
  let str = '' // {name. value} //str返回所有属性拼接后的字符串
  for(let i=0; i<attrs.length; i++){
    let attr = attrs[i];
    if(attr.name === 'style'){ //style属性特殊处理，因为要对style属性加一个{}，style标签返回的是一个对象
      let obj = {};
      
      // color:red;background:red => {color:'red'}
      // 每一项用;分割，然后每一项item用：分割出属性和属性名
      //用;分割出来的是一个属性名加属性值
      attr.value.split(';').forEach(item => {
        let [key, value] = item.split(':')
        obj[key] = value;
      });
      attr.value = obj;
    }
    str += `${attr.name}:${JSON.stringify(attr.value)},` //这里是加上每个属性
  }
  return `{${str.slice(0,-1)}}`; //因为每个属性直接都是用 , 隔开，所以最后一个属性多了一个逗号 所以进行截取
  //最终返回的结果样子：{id:"app",style:{"color":"aqua"," background":" yellow"}}
}


const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g //匹配的是表达式的变量 {{ name }} 这里会匹配出name
function gen(node){
  if(node.type === 1){ //是节点
    return codegen(node); //继续递归遍历
  } else { //是文本
    let text = node.text;
    if(!defaultTagRE.test(text)){ //如果没有匹配到双括号的变量，说明是一个纯文本，直接使用JSON.stringify
      return `_v(${JSON.stringify(text)})`
    } else { //说明出现了变量：比如是{{name}}
      //eg: _v(_s(name) + 'hello' + _s(name))
      let tokens = []; //最后匹配到的多个变量
      let match; //每次匹配到的变量
      defaultTagRE.lastIndex = 0; //将lastIndex属性置为0：因为exec匹配只会每次重头开始匹配，我们需要让它继续上一次的位置进行匹配
      let lastIndex = 0;
      while(match = defaultTagRE.exec(text)){ //循环匹配，因为有多个变量
        let index = match.index;
        if(index > lastIndex){ // 这里是用来匹配 {{name}} hello {{age}} 中的hello
          tokens.push(JSON.stringify(text.slice(lastIndex,index))) //自己的普通字符串直接stringify就行
        }
        tokens.push(`_s(${match[1].trim()})`) //对于变量，要用_s包裹
        lastIndex = index + match[0].length //lastIndex每次都要向前进一步：超过当前变量的长度
      }
      if(lastIndex < text.length){ //这里是用来匹配 {{name}} hello {{age}} hello 中的第二个hello
        tokens.push(JSON.stringify(text.slice(lastIndex))) //最后出现的普通字符串也是只用stringify就行
      }
      return `_v(${tokens.join('+')})`
    }
  }
}

//genChildren函数处理孩子
function genChildren(children){
  return children.map(child => gen(child))
}


// codegen函数用来将ast生成render函数（render函数其实就是一个字符串，用with调用来使这个字符串变成函数，通过调用可以生成虚拟DOM）
function codegen(ast){
  let children = genChildren(ast.children);
  let code = (`_c('${ ast.tag }', ${ ast.attrs.length > 0 ? genProps(ast.attrs) : 'null' }${ ast.children.length ? `,${ children }` : '' })`)
    /**
     * 上面分别是自己的标签，属性，孩子（属性和孩子之间的,放在了孩子那里再加）
     */
  return code
}

//对模板进行编译处理
export function compileToFunction(template) {
  // 第一步：将template 转换为 ast语法树
  let ast = parseHTML(template)
  console.log('生成的ast树：',ast) //验证ast树

  // 第二步：生成render方法（render方法执行后返回的结果就是 虚拟DOM）
  /**我们最终要转换成的render函数
    render(){
      return _c('div',{style:{color:'red'}},_v('hello'+_s(name)),_c('span',undefined,''))
    }
    _c：创建元素  _v：创建文本  _s: JSON.stringify
   */
  let code = codegen(ast); //现在已经生成了render函数的字符串，接下来我们需要让字符串可以运行
  code = `with(this){return ${code}}` //包了一层with，那么code中的代码都会去this上取值，那么一会儿我们准备执行的时候，可以绑定个this，这样我们就可以随意的指定要执行的对象了
  //因为我们的render函数上的变量比如name,age都在vm上，所以一会儿我们执行render函数的时候可以设置.call(vm)，这样就拿到了vm身上的变量值

  let render = new Function(code);//生成render函数
  /**
   * with是干嘛的？
   * let obj = {a:1}
   * with(obj){
   *  console.log(a)
   * }
   * 对于上面这段代码：在{}里面的代码都会去obj上取值，也就是说：with可以限定取值的对象是谁
   */



  return render;
}