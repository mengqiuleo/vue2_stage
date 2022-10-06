const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;  
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 匹配标签开头 捕获的内容是标签名
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾的 </div>
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的，第一个分组就是属性的key, value就是 分组3、分组4、分组5
const startTagClose = /^\s*(\/?)>/; // 匹配开始标签结束的 >
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g //匹配的是表达式的变量 {{ name }} 这里会匹配出name

// 将模板解析成ast语法树
//思路：匹配一部分，然后删掉这部分，直到删除完毕，使用while函数
export function parseHTML(html) { //html最开始肯定是一个<
  const ELEMENT_TYPE = 1; //标签类型
  const TEXT_TYPE = 3; //文本类型
  const stack = [];//构建父子关系
  let currentParent; //指向的是栈中的最后一个：当前的父亲
  let root;

  function createASTElement(tag, attrs){
    return {
      tag,
      type: ELEMENT_TYPE,
      children: [],
      attrs,
      parent: null
    }
  }

  //下面三个函数用来处理匹配到的标签和属性
  function start(tag, attrs){ //遇到开始标签：创建一个元素
    let node = createASTElement(tag, attrs)
    if(!root){ //看一下是否为空树
      root = node; //如果为空则当前是数的根节点
    }
    if(currentParent){
      node.parent = currentParent
      currentParent.children.push(node)
    }
    stack.push(node);
    currentParent = node; //currentParent是最近的父节点
  }
  function end(tag){
    let node = stack.pop();
    currentParent = stack[stack.length - 1]
  }
  function chars(text) {
    text = text.replace(/\s/g,'') //替换掉空文本
    text && currentParent.children.push({
      type: TEXT_TYPE,
      text,
      parent: currentParent
    })
  }


  function advance(n){
    html = html.substring(n);
  }

  //该函数用来匹配开始标签
  function parseStartTag(){
    const start = html.match(startTagOpen);
    // console.log(start); start是一个数组，打印查看
    if(start) { //如果是开始标签
      const match = {
        tagName: start[1], //标签名(其实对于start数组我们可以将值打印出来看)
        attrs: [] //标签属性
      }
      advance(start[0].length); //前进：将已经匹配了的删除
      // console.log(match, html);

      //走到这一步：已经将开始标签匹配完了：就是将 <div 匹配到，接下来该匹配开始标签里面的属性了

      // 如果不是开始标签的结束，说明是属性：就一直匹配下去（一直在匹配属性）
      let attr; //一个变量：存储属性
      let end; //一个变量：存储开始标签的结束> eg: <div id='app'> 这里匹配的是右边的 >
      while(!(end = html.match(startTagClose)) && (attr = html.match(attribute))){
        advance(attr[0].length) //删掉属性
        match.attrs.push({name: attr[1], value: attr[3] || attr[4] || attr[5]})
      }
      //删掉开始标签的右>
      if(end){
        advance(end[0].length)
      }
      return match;
    }
    
    return false; //不是开始标签
  }

  //一直匹配直到html解析完
  while(html){
    // 如果textEnd 为0， 说明是一个开始标签或者 是结束标签(如果是结束标签的话，那么就说明结束标签前面的字符全部被匹配完毕，并且也被删除了，因为我们的匹配会将匹配完的地方逐渐删除掉)
    // 如果textEnd 大于0，说明是这样的： hello</div> , 此时还在匹配文本串
    let textEnd = html.indexOf('<'); 

    if(textEnd == 0){ //如果是开始标签
      const startTagMatch = parseStartTag(); //开始标签的匹配结果
      if(startTagMatch){
        start(startTagMatch.tagName, startTagMatch.attrs)
        // 在这里，开始标签已经截取结束了。那么就continue，跳出循环然后继续向后匹配
        continue;
      }

      // 如果不是开始标签，那就是匹配开始标签的结束标签（因为上面直接continue了，所以开始和结束只会匹配一个）
      let endTagMatch = html.match(endTag)
      if(endTagMatch){
        advance(endTagMatch[0].length)
        end(endTagMatch[1]) 
        continue;
      }
    }

    if(textEnd > 0){ //如果是文本内容
      let text = html.substring(0,textEnd)
      if(text){
        chars(text)
        advance(text.length)//移出解析到的文本
      }
    }
  }
  // console.log("解析到的ast树：", root)
  return root;
}