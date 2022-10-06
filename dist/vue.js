(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;

    var _s, _e;

    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 匹配标签开头 捕获的内容是标签名

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配标签结尾的 </div>

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的，第一个分组就是属性的key, value就是 分组3、分组4、分组5

  var startTagClose = /^\s*(\/?)>/; // 匹配开始标签结束的 >
  // 将模板解析成ast语法树
  //思路：匹配一部分，然后删掉这部分，直到删除完毕，使用while函数

  function parseHTML(html) {
    //html最开始肯定是一个<
    var ELEMENT_TYPE = 1; //标签类型

    var TEXT_TYPE = 3; //文本类型

    var stack = []; //构建父子关系

    var currentParent; //指向的是栈中的最后一个：当前的父亲

    var root;

    function createASTElement(tag, attrs) {
      return {
        tag: tag,
        type: ELEMENT_TYPE,
        children: [],
        attrs: attrs,
        parent: null
      };
    } //下面三个函数用来处理匹配到的标签和属性


    function start(tag, attrs) {
      //遇到开始标签：创建一个元素
      var node = createASTElement(tag, attrs);

      if (!root) {
        //看一下是否为空树
        root = node; //如果为空则当前是数的根节点
      }

      if (currentParent) {
        node.parent = currentParent;
        currentParent.children.push(node);
      }

      stack.push(node);
      currentParent = node; //currentParent是最近的父节点
    }

    function end(tag) {
      stack.pop();
      currentParent = stack[stack.length - 1];
    }

    function chars(text) {
      text = text.replace(/\s/g, ''); //替换掉空文本

      text && currentParent.children.push({
        type: TEXT_TYPE,
        text: text,
        parent: currentParent
      });
    }

    function advance(n) {
      html = html.substring(n);
    } //该函数用来匹配开始标签


    function parseStartTag() {
      var start = html.match(startTagOpen); // console.log(start); start是一个数组，打印查看

      if (start) {
        //如果是开始标签
        var match = {
          tagName: start[1],
          //标签名(其实对于start数组我们可以将值打印出来看)
          attrs: [] //标签属性

        };
        advance(start[0].length); //前进：将已经匹配了的删除
        // console.log(match, html);
        //走到这一步：已经将开始标签匹配完了：就是将 <div 匹配到，接下来该匹配开始标签里面的属性了
        // 如果不是开始标签的结束，说明是属性：就一直匹配下去（一直在匹配属性）

        var attr; //一个变量：存储属性

        var _end; //一个变量：存储开始标签的结束> eg: <div id='app'> 这里匹配的是右边的 >


        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          advance(attr[0].length); //删掉属性

          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5]
          });
        } //删掉开始标签的右>


        if (_end) {
          advance(_end[0].length);
        }

        return match;
      }

      return false; //不是开始标签
    } //一直匹配直到html解析完


    while (html) {
      // 如果textEnd 为0， 说明是一个开始标签或者 是结束标签(如果是结束标签的话，那么就说明结束标签前面的字符全部被匹配完毕，并且也被删除了，因为我们的匹配会将匹配完的地方逐渐删除掉)
      // 如果textEnd 大于0，说明是这样的： hello</div> , 此时还在匹配文本串
      var textEnd = html.indexOf('<');

      if (textEnd == 0) {
        //如果是开始标签
        var startTagMatch = parseStartTag(); //开始标签的匹配结果

        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs); // 在这里，开始标签已经截取结束了。那么就continue，跳出循环然后继续向后匹配

          continue;
        } // 如果不是开始标签，那就是匹配开始标签的结束标签（因为上面直接continue了，所以开始和结束只会匹配一个）


        var endTagMatch = html.match(endTag);

        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]);
          continue;
        }
      }

      if (textEnd > 0) {
        //如果是文本内容
        var text = html.substring(0, textEnd);

        if (text) {
          chars(text);
          advance(text.length); //移出解析到的文本
        }
      }
    } // console.log("解析到的ast树：", root)


    return root;
  }

  function genProps(attrs) {
    var str = ''; // {name. value} //str返回所有属性拼接后的字符串

    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];

      if (attr.name === 'style') {
        (function () {
          //style属性特殊处理，因为要对style属性加一个{}，style标签返回的是一个对象
          var obj = {}; // color:red;background:red => {color:'red'}
          // 每一项用;分割，然后每一项item用：分割出属性和属性名
          //用;分割出来的是一个属性名加属性值

          attr.value.split(';').forEach(function (item) {
            var _item$split = item.split(':'),
                _item$split2 = _slicedToArray(_item$split, 2),
                key = _item$split2[0],
                value = _item$split2[1];

            obj[key] = value;
          });
          attr.value = obj;
        })();
      }

      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ","); //这里是加上每个属性
    }

    return "{".concat(str.slice(0, -1), "}"); //因为每个属性直接都是用 , 隔开，所以最后一个属性多了一个逗号 所以进行截取
    //最终返回的结果样子：{id:"app",style:{"color":"aqua"," background":" yellow"}}
  }

  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; //匹配的是表达式的变量 {{ name }} 这里会匹配出name

  function gen(node) {
    if (node.type === 1) {
      //是节点
      return codegen(node); //继续递归遍历
    } else {
      //是文本
      var text = node.text;

      if (!defaultTagRE.test(text)) {
        //如果没有匹配到双括号的变量，说明是一个纯文本，直接使用JSON.stringify
        return "_v(".concat(JSON.stringify(text), ")");
      } else {
        //说明出现了变量：比如是{{name}}
        //eg: _v(_s(name) + 'hello' + _s(name))
        var tokens = []; //最后匹配到的多个变量

        var match; //每次匹配到的变量

        defaultTagRE.lastIndex = 0; //将lastIndex属性置为0：因为exec匹配只会每次重头开始匹配，我们需要让它继续上一次的位置进行匹配

        var lastIndex = 0;

        while (match = defaultTagRE.exec(text)) {
          //循环匹配，因为有多个变量
          var index = match.index;

          if (index > lastIndex) {
            // 这里是用来匹配 {{name}} hello {{age}} 中的hello
            tokens.push(JSON.stringify(text.slice(lastIndex, index))); //自己的普通字符串直接stringify就行
          }

          tokens.push("_s(".concat(match[1].trim(), ")")); //对于变量，要用_s包裹

          lastIndex = index + match[0].length; //lastIndex每次都要向前进一步：超过当前变量的长度
        }

        if (lastIndex < text.length) {
          //这里是用来匹配 {{name}} hello {{age}} hello 中的第二个hello
          tokens.push(JSON.stringify(text.slice(lastIndex))); //最后出现的普通字符串也是只用stringify就行
        }

        return "_v(".concat(tokens.join('+'), ")");
      }
    }
  } //genChildren函数处理孩子


  function genChildren(children) {
    return children.map(function (child) {
      return gen(child);
    });
  } // codegen函数用来将ast生成render函数（render函数其实就是一个字符串，用with调用来使这个字符串变成函数，通过调用可以生成虚拟DOM）


  function codegen(ast) {
    var children = genChildren(ast.children);
    var code = "_c('".concat(ast.tag, "', ").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : 'null').concat(ast.children.length ? ",".concat(children) : '', ")");
    /**
     * 上面分别是自己的标签，属性，孩子（属性和孩子之间的,放在了孩子那里再加）
     */

    return code;
  } //对模板进行编译处理


  function compileToFunction(template) {
    // 第一步：将template 转换为 ast语法树
    var ast = parseHTML(template);
    console.log('生成的ast树：', ast); //验证ast树
    // 第二步：生成render方法（render方法执行后返回的结果就是 虚拟DOM）

    /**我们最终要转换成的render函数
      render(){
        return _c('div',{style:{color:'red'}},_v('hello'+_s(name)),_c('span',undefined,''))
      }
      _c：创建元素  _v：创建文本  _s: JSON.stringify
     */

    var code = codegen(ast); //现在已经生成了render函数的字符串，接下来我们需要让字符串可以运行

    code = "with(this){return ".concat(code, "}"); //包了一层with，那么code中的代码都会去this上取值，那么一会儿我们准备执行的时候，可以绑定个this，这样我们就可以随意的指定要执行的对象了
    //因为我们的render函数上的变量比如name,age都在vm上，所以一会儿我们执行render函数的时候可以设置.call(vm)，这样就拿到了vm身上的变量值

    var render = new Function(code); //生成render函数

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

  /*
   * @Author: Pan Jingyi
   * @Date: 2022-10-04 17:45:37
   * @LastEditTime: 2022-10-05 23:23:41
   */
  // 重写数组中的部分方法
  var oldArrayProto = Array.prototype; //获取数组的原型

  var newArrayProto = Object.create(oldArrayProto);
  var methods = [//找到所有变异方法
  'push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice']; //concat slice 都不会改变原数组

  methods.forEach(function (method) {
    //arr.push(1,2,3)
    newArrayProto[method] = function () {
      var _oldArrayProto$method;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      //这里重写了数组的方法
      var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args)); //内部调用原来的方法
      //我们需要对新增的数据再次进行劫持


      var inserted; //该变量存放新增的数据值
      // 根据newArrayProto的被引用位置：我们可以得知，这里的this应该是 class Observe的实例对象

      var ob = this.__ob__; //这里的ob就是Observe实例，并且它身上有对数组进行观测的observeArray方法

      switch (method) {
        case 'push':
        case 'unshift':
          //arr.unshift(1,2,3)
          inserted = args;
          break;

        case 'splice':
          //arr.splice(0,1,{a:1})
          inserted = args.slice(2);
      }

      console.log('新增的数组的数据：', inserted);

      if (inserted) {
        //对新增的内容再次进行观测
        //既然要对新增的数据进行观测：那么还是要调用最初监测数组的方法来对新增数据进行观测
        //那个新增的方法在Observe实例的observeArray函数，所以我们要拿到Observe实例
        //怎么拿？ 在Observe类中，我们已经绑定了this到__ob__属性上，并且在这里：根据这里被调用的位置可知，这里的this就是class Observe的实例对象
        //所以，我们直接拿一个变量来承接Observe实例 -> let ob = this.__ob__;(在上面已经声明过了)
        //下面就是对新增的数据再次进行观测
        ob.observeArray(inserted);
      }

      ob.dep.notify(); //数组变化，通知对应的watcher进行更新

      return result;
    };
  });

  /*
   * @Author: Pan Jingyi
   * @Date: 2022-10-05 21:24:29
   * @LastEditTime: 2022-10-06 18:31:50
   */
  var id$1 = 0;

  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);

      this.id = id$1++;
      this.subs = []; //这里存放这当前属性对应的watcher有哪些
    }

    _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        //我们希望dep和watcher实现双向收集
        Dep.target.addDep(this); //Dep.target指的是当前的watcher，然后调用watcher的addDep方法
      }
    }, {
      key: "addSub",
      value: function addSub(watcher) {
        this.subs.push(watcher); //当前dep收集当前watcher
      }
    }, {
      key: "notify",
      value: function notify() {
        //通知该属性的所有watcher都要进行更新
        this.subs.forEach(function (watcher) {
          return watcher.update();
        });
      }
    }]);

    return Dep;
  }();

  Dep.target = null; //暴露一个属性用来连接dep和watcher

  var stack = []; // 存储计算属性的watcher

  function pushTarget(watcher) {
    stack.push(watcher);
    Dep.target = watcher;
  }
  function popTarget() {
    stack.pop();
    Dep.target = stack[stack.length - 1];
  }

  /*
   * @Author: Pan Jingyi
   * @Date: 2022-10-04 15:33:12
   * @LastEditTime: 2022-10-05 23:29:30
   */

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);

      //给数组本身增加dep,如果数组新增了某一项，就要触发dep更新
      //给对象增加dep，如果后序用户增加了属性，也要触发dep更新
      //要给每个对象都增加收集功能
      this.dep = new Dep(); //Object.defineProperty只能劫持已经存在的属性（vue里面会为此单独写一些api $set $delete）

      Object.defineProperty(data, '__ob__', {
        value: this,
        enumerable: false //将__ob__变成不可枚举型（循环时无法获取到）

      }); //上面就是一个定义属性，不必要再写 data.__ob__ = this; 这句代码
      //data.__ob__ = this;//将this实例绑定到__ob__属性上
      //不仅是将this绑定到__ob__属性上，方便再次对新增的数组内容进行观测（具体观测在array.js文件中）
      //而且也给数据加了一个标识：因为在最初的入口中，我们需要判断当前数据是否被劫持过了，如果已经被劫持了，那就直接返回：
      //如果一个对象被劫持过了，那就不需要再被劫持了（要判断一个对象是否被劫持过，可以增添一个实例，用实例来判断是否被劫持过）
      //既然是用一个实例来判断当前数据是否被劫持过了：
      //那么这个 __ob__ 属性就是一个标识，如果数据已经被劫持了，那么它的实例身上一定有一个__ob__的标识
      //具体代码在 observe(data)函数中体现
      // 增加这个__ob__属性，其实会有一点问题 -> 会产生死循环
      // 因为给当前类的实例增加了这个属性的值是this代指当前对象
      //当我们对进行属性劫持并且遍历各个属性值时，走到defineReactive函数，进行set设置时，又会走observe函数，然后又会进到类的实例中，
      // 在类的实例中，又会对对象进行劫持，然后就会产生死循环
      //如何解决？ 将这个属性变成不可枚举型的，这部分操作在上面

      if (Array.isArray(data)) {
        //这里我们可以重写数组中的方法，7个变异方法是可以修改数组本身的
        data.__proto__ = newArrayProto; //保留数组原有的特性，并且重写部分方法

        this.observeArray(data); //如果数组中放的是对象，可以监控到对象的变化
      } else {
        this.walk(data);
      }
    }

    _createClass(Observer, [{
      key: "walk",
      value: function walk(data) {
        //循环对象，对象属性依次劫持
        // 重新定义属性
        Object.keys(data).forEach(function (key) {
          return defineReactive(data, key, data[key]);
        });
      }
    }, {
      key: "observeArray",
      value: function observeArray(data) {
        // 对数组中的是对象的某一项进行观测
        data.forEach(function (item) {
          return observe(item);
        });
      }
    }]);

    return Observer;
  }();

  function dependArray(value) {
    for (var i = 0; i < value.length; i++) {
      var current = value[i];
      current.__ob__ && current.__ob__.dep.depend();

      if (Array.isArray(current)) {
        dependArray(current);
      }
    }
  } // 数据劫持
  // 执行get时会进行dep和watcher的收集，在执行set时，让dep更新


  function defineReactive(target, key, value) {
    var childOb = observe(value); //递归进行：如果属性是对象那就继续进行代理
    //childOb中就有一个dep属性 用来收集依赖

    var dep = new Dep(); //每一个属性都增加一个dep 

    Object.defineProperty(target, key, {
      get: function get() {
        //取值的时候 执行get
        if (Dep.target) {
          dep.depend(); //让这个属性的收集器记住当前的watcher

          if (childOb) {
            childOb.dep.depend(); //让数组和对象本身也实现依赖收集

            if (Array.isArray(value)) {
              dependArray(value);
            }
          }
        }

        return value;
      },
      set: function set(newValue) {
        //修改的时候，会执行set
        if (newValue) {
          if (newValue === value) return;
          observe(value); //递归进行：如果设置的值还是对象那就继续进行代理

          value = newValue;
          dep.notify(); //更新dep,通知watcher进行更新
        }
      }
    });
  }
  function observe(data) {
    //对对象进行劫持
    if (_typeof(data) !== 'object' || data == null) {
      return; //只对对象进行劫持
    }

    if (data.__ob__ instanceof Observer) {
      //说明这个对象被代理过了
      return data.__ob__;
    } //如果一个对象被劫持过了，那就不需要再被劫持了（要判断一个对象是否被劫持过，可以增添一个实例，用实例来判断是否被劫持过）


    return new Observer(data); //我们返回的是一个被劫持过的对象
  }

  /**
   * 每一个组件都有一个watcher，watcher中放了一个组件中的很多属性dep，并且我们给每个组件赋一个id标识
   * 每一个属性有一个dep属性，里面存放了这个属性的watcher，可能一个属性的dep中存放了很多个watcher，因为这个属性在很多地方都用到了
   * 当这个组件的属性没有被渲染时，dep和watcher是不会被收集的
   */

  var id = 0;

  var Watcher = /*#__PURE__*/function () {
    function Watcher(vm, fn, options) {
      _classCallCheck(this, Watcher);

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

    _createClass(Watcher, [{
      key: "addDep",
      value: function addDep(dep) {
        //让当前watcher收集它的dep
        var id = dep.id; //拿到该dep的id

        if (!this.depsId.has(id)) {
          //如果一个属性在视图上进行多次渲染，但是只需要收集一次
          this.deps.push(dep);
          this.depsId.add(id);
          dep.addSub(this); //让dep记住watcher
        }
      }
    }, {
      key: "get",
      value: function get() {
        pushTarget(this); //在执行watcher之前，将当前dep增加一个当前watcher，这样我们就将当前dep和watcher连接起来了
        //当我们创建渲染watcher的时候，我们会把当前的渲染watcher放到Dep.target上

        this.getter(); //会去vm上取值，此时就调用了vm._update(vm._render())，当调用该render函数时，我们就会走到数据劫持的get()上

        popTarget(); //当当前组件渲染完毕后，我们就将target清空
      }
    }, {
      key: "update",
      value: function update() {
        //我们需要实现异步更新：即多次修改值只会最终执行一次视图更新
        //实现方案：使用异步更新 -> 事件环
        // this.get(); //重新渲染
        queueWatcher(this); //把当前的watcher暂存起来
      }
    }, {
      key: "run",
      value: function run() {
        // console.log('更新视图只执行一次')
        this.get(); //重新渲染
      }
    }]);

    return Watcher;
  }();

  var queue = [];
  var has = {}; //实现去重

  var pending = false; //防抖：多次修改值，只进行一轮刷新

  function flushSchedulerQueue() {
    //执行所有要进行的更新视图操作
    var flushQueue = queue.slice(0);
    queue = [];
    has = {};
    pending = false;
    flushQueue.forEach(function (q) {
      return q.run();
    });
  }

  function queueWatcher(watcher) {
    var id = watcher.id;

    if (!has[id]) {
      queue.push(watcher);
      has[id] = true; //不管我们的update执行多少次，但是最终只执行一轮刷新操作

      if (!pending) {
        //setTimeout(flushSchedulerQueue,0);
        //原来我们是使用setTimeout实现异步更新，但是其实底层我们可以也可以使用promise来实现异步更新
        //vue为了统一，实现了自己的异步更新方法：nextTick
        nextTick(flushSchedulerQueue);
        pending = true;
      }
    }
  }

  var callbacks = [];
  var waiting = false;

  function flushCallbacks() {
    waiting = false;
    var cbs = callbacks.slice(0);
    callbacks = [];
    cbs.forEach(function (cb) {
      return cb();
    });
  } //nextTick 没有直接使用某个api 而是采用优雅降级的方式
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


  function nextTick(cb) {
    //会先调用户写的nextTick还是内部的nextTick？？ 不一定，谁放在前面就先执行谁
    callbacks.push(cb);

    if (!waiting) {
      // timerFunc();
      Promise.resolve().then(flushCallbacks);
      waiting = true;
    }
  }

  /*
   * @Author: Pan Jingyi
   * @Date: 2022-10-04 15:28:08
   * @LastEditTime: 2022-10-06 19:17:22
   */
  function initState(vm) {
    var opts = vm.$options; //获取所有选项

    if (opts.data) {
      initData(vm);
    }

    if (opts.computed) {
      initComputed(vm);
    }
  } //将 vm._data 用 vm 来代理

  function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[target][key];
      },
      set: function set(newValue) {
        vm[target][key] = newValue;
      }
    });
  }

  function initData(vm) {
    var data = vm.$options.data; //data可能是函数或者对象
    // 这里我们只是拿到了用户的数据，但是得把数据绑定到vm上，如何绑定呢？用 _data

    data = typeof data === 'function' ? data.call(vm) : data; //data是用户返回的对象

    vm._data = data; //我将返回的对象放到了_data上
    //现在已经成功绑定了，但是访问不太方便：vm._data.name
    //怎么变方便呢？ -> 将 vm._data 用 vm 来代理
    // 接下来是对数据进行劫持 vue2里采用了一个api defineProperty

    observe(data); //将 vm._data 用 vm 来代理

    for (var _key in data) {
      proxy(vm, '_data', _key);
    }
  }
  /**
   * 计算属性 依赖的值发生变化才会重新执行用户的方法，计算属性中要维护一个dirty属性，默认计算属性不会立即执行
   * 计算属性就是一个defineProperty
   * 计算属性也是一个watcher，默认渲染会创造一个渲染watcher
   */


  function initComputed(vm) {
    var computed = vm.$options.computed;
    var watchers = vm._computedWatchers = {}; //将计算属性watcher保存到vm上
    // console.log(computed)

    for (var _key2 in computed) {
      var userDef = computed[_key2]; //我们需要监控 计算属性中get的变化

      var fn = typeof userDef === 'function' ? userDef : userDef.get; //如果直接 new Watcher 默认就会执行fn, 将属性和watcher对应起来

      watchers[_key2] = new Watcher(vm, fn, {
        lazy: true
      }); //lazy:true: 如果不取值，就不用执行watcher
      //将getter和setter进行数据劫持

      defineComputed(vm, _key2, userDef);
    }
  }

  function defineComputed(target, ket, userDef) {
    //拿到对应的getter和setter
    var getter = typeof userDef === 'function' ? userDef : userDef.get;

    var setter = userDef.set || function () {}; //可以通过实例拿到setter和getter属性


    Object.defineProperty(target, key, {
      get: createComputedGetter(getter, key),
      set: setter
    });
  }

  function createComputedGetter(key) {
    //我们需要监测是否要执行这个getter
    return function () {
      this._computedWatchers[key]; //获取到对应属性的watcher
    };
  }

  function initStateMixin(Vue) {
    Vue.prototype.$nextTick = nextTick;
  }

  /*
   * @Author: Pan Jingyi
   * @Date: 2022-10-05 10:46:26
   * @LastEditTime: 2022-10-06 16:07:43
   */
  //_c() 创建文本
  function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
  } //_v() 创建节点

  function createElementVNode(vm, tag) {
    var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    if (data == null) {
      data = {};
    }

    var key = data.key;

    if (key) {
      //上面我们已经取出了key，所以可以删掉key
      delete data.key;
    }

    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }

    return vnode(vm, tag, key, data, children);
  } // 虚拟dom比ast功能更强大，可以增加一些自定义属性

  function vnode(vm, tag, key, data, children, text) {
    return {
      vm: vm,
      tag: tag,
      key: key,
      data: data,
      children: children,
      text: text
    };
  }

  function isSameVNode(vnode1, vnode2) {
    return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key;
  }

  /*
   * @Author: Pan Jingyi
   * @Date: 2022-10-06 14:52:15
   * @LastEditTime: 2022-10-06 18:14:36
   */

  function createElm(vnode) {
    var tag = vnode.tag,
        data = vnode.data,
        children = vnode.children,
        text = vnode.text;

    if (typeof tag === 'string') {
      //如果是标签
      vnode.el = document.createElement(tag); //??? 将真实节点和虚拟节点对应起来

      patchProps(vnode.el, {}, data); //绑定属性

      children.forEach(function (child) {
        vnode.el.appendChild(createElm(child));
      });
    } else {
      vnode.el = document.createTextNode(text);
    }

    return vnode.el;
  } //对比新旧节点的属性

  function patchProps(el) {
    var oldProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var props = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    //更新属性
    //老的属性中有，新的没有，要删除老的
    var oldStyles = oldProps.style || {};
    var newStyles = props.style || {}; //老的样式中有，新的没有，则删除

    for (var key in oldStyles) {
      if (!newStyles[key]) {
        el.style[key] = '';
      }
    }

    for (var _key in oldProps) {
      //老的属性中有，新的没有，删除
      if (!props[_key]) {
        el.removeAttribute(_key);
      }
    }

    for (var _key2 in props) {
      //用新的覆盖掉老的
      if (_key2 === 'style') {
        for (var styleName in props.style) {
          el.style[styleName] = props.style[styleName];
        }
      } else {
        el.setAttribute(_key2, props[_key2]);
      }
    }
  } // patch(el,vnode)

  function patch(oldVNode, vnode) {
    var isRealElement = oldVNode.nodeType;

    if (isRealElement) {
      //初渲染流程
      var elm = oldVNode; //获取真实元素

      var parentElm = elm.parentNode; //拿到父元素

      var newElm = createElm(vnode); //此时元素已经创建好了，属性也绑定了

      parentElm.insertBefore(newElm, elm.nextSibling); //插入新节点

      parentElm.removeChild(elm); //删除老节点

      return newElm;
    } else {
      //diff算法

      /**
       * 1.两个节点不是同一个节点，直接删除老的换上新的（没有比对了）
       * 2.两个节点是同一个节点（判断节点的tag和节点的key）比较两个节点的属性是否有差异（复用老的节点，将差异的属性更新）
       * 3.节点比较完毕后就需要比较两个节点的儿子
       */
      return patchVNode(oldVNode, vnode);
    }
  }

  function patchVNode(oldVNode, vnode) {
    //两个节点不是同一个节点，直接删除老的换上新的（没有比对了）
    if (!isSameVNode(oldVNode, vnode)) {
      //tag===tag && key===key
      //用老节点的父亲 进行替换
      var _el = createElm(vnode);

      oldVNode.el.parentNode.replaceChild(_el, oldVNode.el);
      return _el;
    } //上面的情况是节点完全不一样，现在是节点一样，先特殊处理文本


    var el = vnode.el = oldVNode.el; //复用老节点的元素

    if (!oldVNode.tag) {
      //是文本
      if (oldVNode.text !== vnode.text) {
        el.textContent = vnode.text; //用新的文本覆盖掉老文本
      }
    } //是标签的情况, 我们需要对比标签的属性


    patchProps(el, oldVNode.data, vnode.data); //开始比较儿子节点

    var oldChildren = oldVNode.children || [];
    var newChildren = vnode.children || [];

    if (oldChildren.length > 0 && newChildren.length > 0) {
      //完整的diff算法，需要比较两个人的儿子
      updateChildren(el, oldChildren, newChildren);
    } else if (newChildren.length > 0) {
      //没有老的，只有新的
      mountChildren(el, newChildren); //挂载新的儿子
    } else if (oldChildren.length > 0) {
      //新的没有
      el.innerHTML = '';
    }

    return el;
  }

  function mountChildren(el, newChildren) {
    for (var i = 0; i < newChildren.length; i++) {
      var child = newChildren[i];
      el.appendChild(createElm(child));
    }
  }

  function updateChildren(el, oldChildren, newChildren) {
    //diff算法只会比较同级的节点
    // vue2采用双指针的算法 ：头指针和尾指针
    //头头，尾尾，头尾，尾头
    var oldStartIndex = 0;
    var oldStartVnode = oldChildren[0];
    var oldEndIndex = oldChildren.length - 1;
    var oldEndVnode = oldChildren[oldEndIndex];
    var newStartIndex = 0;
    var newStartVnode = newChildren[0];
    var newEndIndex = newChildren.length - 1;
    var newEndVnode = newChildren[newEndIndex]; //针对乱序比对 -> 制作一个映射表

    function makeIndexByKey(children) {
      var map = {};
      children.forEach(function (child, index) {
        map[child.key] = index;
      });
      return map;
    }

    var map = makeIndexByKey(oldChildren);

    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
      //双方有一方头指针，大于尾指针则停止循环
      if (!oldStartVnode) {
        //出现不存在节点的原因：使用乱序比对，我们将节点进行移动，当前位置赋为undefined，所以出现不存在的情况，如果出现这种情况，那就向前/后继续移动指针就好了
        oldStartVnode = oldChildren[++oldStartIndex];
      } else if (!oldEndVnode) {
        oldEndVnode = oldChildren[--oldEndIndex];
      } //#头比头
      else if (isSameVNode(oldStartVnode, newStartVnode)) {
        //如果是同一个节点
        patchVNode(oldStartVnode, newStartVnode); //先比较当前节点的属性和样式，并且递归比较子节点

        oldStartVnode = oldChildren[++oldStartIndex];
        newStartVnode = newChildren[++newStartIndex];
      } //#尾比尾
      else if (isSameVNode(oldEndVnode, newEndVnode)) {
        patchVNode(oldEndVnode, newEndVnode);
        oldEndVnode = oldChildren[--oldEndIndex];
        newEndVnode = newChildren[--newEndIndex];
      } //#尾比头
      else if (isSameVNode(oldEndVnode, newStartVnode)) {
        patchVNode(oldEndVnode, newStartVnode); //insertBefore具备移动性，会将原来的元素移动走

        el.insertBefore(oldEndVnode.el, oldStartVnode.el); //将老的尾移动到老的开头

        oldEndVnode = oldChildren[--oldEndIndex]; //老的尾指针向前移动

        newStartVnode = newChildren[++newStartIndex]; //新的头向后移动
      } //#头比尾(全部都是旧结点比新节点)
      else if (isSameVNode(oldStartVnode, newEndVnode)) {
        patchVNode(oldStartVnode, newEndVnode);
        el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling); //将老的头移动到老的尾

        oldStartVnode = oldChildren[++oldStartIndex];
        newEndVnode = newChildren[--newEndIndex];
      } //#乱序比对
      else {
        // 根据老的列表做一个映射关系，用新的去找，找到则移动，找不到则添加，最后多余的删除
        var moveIndex = map[newStartVnode.key]; //如果拿到则说明是我要移动的索引(新旧节点都有，移动即可)

        if (moveIndex !== undefined) {
          var moveVnode = oldChildren[moveIndex]; //找到对应的旧结点 -> 复用

          el.insertBefore(moveVnode.el, oldStartVnode.el); //将要移动的节点插入到旧开始结点的前面！！！

          oldChildren[moveIndex] = undefined; //表示这个节点已经被移动走了

          patchVNode(moveVnode, newStartVnode); //对比属性和子节点
        } else {
          //如果找不到要移动的节点，那就根据新开始节点创造出一个节点，然后插入到旧开始节点的前面
          el.insertBefore(createElm(newStartVnode), oldStartVnode.el);
        }

        newStartVnode = newChildren[++newStartIndex]; //新开始节点向后移动
      }
    }

    if (newStartIndex <= newEndIndex) {
      //如果新dom的节点长度大于旧结点，那就将新节点的多余部分插入
      for (var i = newStartIndex; i <= newEndIndex; i++) {
        var childEl = createElm(newChildren[i]); //这里不仅要适用于头比头，也要适用于尾比尾
        //头比头：在后面继续追加，尾比尾：在前面插入

        var anchor = newChildren[newEndIndex + 1] ? newChildren[newEndIndex + 1].el : null; //anchor是一个参照物：判断新节点的尾指针的下一个是否有值，如果有值，证明是尾比尾，是在前面插入，如果没有值，那证明是头比头，要在后面继续插入

        el.insertBefore(childEl, anchor); // el.appendChild(childEl);
      }
    }

    if (oldStartIndex <= oldEndIndex) {
      //如果新dom的节点长度小于旧结点，那就将旧节点的多余部分删除
      for (var _i = oldStartIndex; _i <= oldEndIndex; _i++) {
        if (oldChildren[_i]) {
          //这部分的逻辑也适用于乱序比对
          var _childEl = oldChildren[_i].el;
          el.removeChild(_childEl);
        }
      }
    }

    console.log(oldStartVnode, newStartVnode);
  }

  function initLifeCycle(Vue) {
    Vue.prototype._update = function (vnode) {
      //将vnode转换成真实dom
      var vm = this;
      var el = vm.$el; //patch既有初始化的功能，又有更新的功能

      vm.$el = patch(el, vnode); //将VNode虚拟节点挂载到el元素上
    };

    Vue.prototype._v = function () {
      // 创建文本
      return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };

    Vue.prototype._c = function () {
      // 创建元素
      return createElementVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };

    Vue.prototype._s = function (val) {
      if (_typeof(val) !== 'object') return val;
      return JSON.stringify(val);
    };

    Vue.prototype._render = function () {
      var vm = this; // call: 让with中的this指向vm

      return vm.$options.render.call(vm); //执行render函数拿到虚拟节点
    };
  } //组件的挂载
  //挂载可以执行render函数产生虚拟节点 虚拟DOM，根据虚拟DOM产生真实DOM，插入到el元素中 

  function mountComponent(vm, el) {
    vm.$el = el; // 1.调用render方法产生虚拟节点 虚拟DOM
    // vm._render()
    // 2.根据虚拟DOM产生真实DOM
    // vm._update(vm._render())

    var updatedComponent = function updatedComponent() {
      vm._update(vm._render());
    };

    new Watcher(vm, updatedComponent, true); //true用于表示是一个渲染watcher
    // 3.插入到el元素中
  }

  /*
   * @Author: Pan Jingyi
   * @Date: 2022-10-04 15:16:44
   * @LastEditTime: 2022-10-05 10:40:37
   */
  function initMixin(Vue) {
    //就是给Vue增加init方法的
    Vue.prototype._init = function (options) {
      //用于初始化话操作
      // vm.$options 就是获取用户的配置
      var vm = this;
      vm.$options = options; //将用户的选项挂载到实例上
      //初始化状态：就是挂载属性，方法，计算属性...

      initState(vm);

      if (options.el) {
        vm.$mount(options.el); //实现数据的挂载
      }
    };

    Vue.prototype.$mount = function (el) {
      var vm = this;
      el = document.querySelector(el);
      var ops = vm.$options; //优先级：render > template > el
      //如果没有render

      if (!ops.render) {
        //先进行查找有没有render函数
        var template; //没有render查看是否写了template，没有写template就用外部的template

        if (!ops.template && el) {
          //没有写模板，但是写了 el
          template = el.outerHTML;
        } else {
          //如果有模板
          if (el) {
            template = ops.template;
          }
        } //写了template，就用写了的template


        if (template && el) {
          //这里需要对模板进行编译
          var render = compileToFunction(template); //根据template生成一个render函数

          ops.render = render; //挂载render属性
        }
      }

      mountComponent(vm, el); //组件的挂载
      //有render就直接获取，我们最终都是要拿到一个render函数

      ops.render; //最终就可以获取render方法 -> 获取：vm.$options.render
      // 后续每次数据更新可以只执行render函数无需调用ast转换的过程
    };
  }

  /*
   * @Author: Pan Jingyi
   * @Date: 2022-10-04 14:36:30
   * @LastEditTime: 2022-10-06 17:32:13
   */

  function Vue(options) {
    //options就是用户的选项
    this._init(options);
  }

  initMixin(Vue); //扩展了init方法

  initLifeCycle(Vue); //vm_update vm._render

  initStateMixin(Vue); //实现了nextTick $watcher
  // diff的测试代码

  var render1 = compileToFunction("<ul key='a' a='1' style='color:red'>\n  <li key='a'>a</li>\n  <li key='b'>b</li>\n  <li key='c'>c</li>\n</ul>");
  var vm1 = new Vue({
    data: {
      name: 'zf'
    }
  });
  var prevVNode = render1.call(vm1);
  var el = createElm(prevVNode);
  document.body.appendChild(el);
  var render2 = compileToFunction("<li key='a' a='1' style='color:red'>\n  <li key='d'>d</li>\n  <li key='a'>a</li>\n  <li key='b'>b</li>\n  <li key='c'>c</li>\n</li>");
  var vm2 = new Vue({
    data: {
      name: 'zf'
    }
  });
  var nextVNode = render2.call(vm2);
  console.log(prevVNode, nextVNode);
  setTimeout(function () {
    patch(prevVNode, nextVNode); // let newEl = createEle(nextVNode)
    // el.parentNode.replaceChild(newEl, el)
  }, 1000);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
