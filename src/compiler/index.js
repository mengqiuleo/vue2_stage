/*
 * @Author: Pan Jingyi
 * @Date: 2022-10-04 19:50:35
 * @LastEditTime: 2022-10-04 20:44:23
 */
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;  
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 匹配标签开头 捕获的内容是标签名
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾的 </div>
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的，第一个分组就是属性的key, value就是 分组3、分组4、分组5
const startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 >
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g //匹配的是表达式的变量 {{ name }} 这里会匹配出name

// 将模板解析成ast语法树
//思路：匹配一部分，然后删掉这部分，直到删除完毕，使用while函数
function parseHTML(html) { //html最开始肯定是一个<
  function advance(n){
    html = html.substring(n);
  }

  function parseStartTag(){
    const start = html.match(startTagOpen);
    // console.log(start); start是一个数组，打印查看
    if(start) {
      const match = {
        tagName: start[1], //标签名(其实对于start数组我们可以将值打印出来看)
        attrs: [] //标签属性
      }
      advance(start[0].length); //前进：将已经匹配了的删除
      // console.log(match, html);
    }
    return false; //不是开始标签
  }


  while(html){
    // 如果textEnd 为0， 说明是一个开始标签或者 是结束标签(如果是结束标签的话，那么就说明结束标签前面的字符全部被匹配完毕，并且也被删除了，因为我们的匹配会将匹配完的地方逐渐删除掉)
    // 如果textEnd 大于0，说明是这样的： hello</div> , 此时还在匹配文本串
    let textEnd = html.indexOf('<'); 

    if(textEnd == 0){ //如果是开始标签
      parseStartTag();

      break;
    }
  }

}

//对模板进行编译处理
export function compileToFunction(template) {
  // 第一步：将template 转换为 ast语法树
  let ast = parseHTML(template)

  // 第二步：生成render方法（render方法执行后返回的结果就是 虚拟DOM）
  console.log(template);
}