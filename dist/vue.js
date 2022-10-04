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

  /*
   * @Author: Pan Jingyi
   * @Date: 2022-10-04 17:45:37
   * @LastEditTime: 2022-10-04 18:10:33
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

      return result;
    };
  });

  /*
   * @Author: Pan Jingyi
   * @Date: 2022-10-04 15:33:12
   * @LastEditTime: 2022-10-04 19:24:10
   */

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);

      //Object.defineProperty只能劫持已经存在的属性（vue里面会为此单独写一些api $set $delete）
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

  function defineReactive(target, key, value) {
    observe(value); //递归进行：如果属性是对象那就继续进行代理

    Object.defineProperty(target, key, {
      get: function get() {
        //取值的时候 执行get
        return value;
      },
      set: function set(newValue) {
        //修改的时候，会执行set
        if (newValue) {
          if (newValue === value) return;
          observe(value); //递归进行：如果设置的值还是对象那就继续进行代理

          value = newValue;
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

  /*
   * @Author: Pan Jingyi
   * @Date: 2022-10-04 15:28:08
   * @LastEditTime: 2022-10-04 15:59:30
   */
  function initState(vm) {
    var opts = vm.$options; //获取所有选项

    if (opts.data) {
      initData(vm);
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

    for (var key in data) {
      proxy(vm, '_data', key);
    }
  }

  /*
   * @Author: Pan Jingyi
   * @Date: 2022-10-04 19:50:35
   * @LastEditTime: 2022-10-04 20:44:23
   */
  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 匹配标签开头 捕获的内容是标签名
  // 将模板解析成ast语法树
  //思路：匹配一部分，然后删掉这部分，直到删除完毕，使用while函数

  function parseHTML(html) {
    //html最开始肯定是一个<
    function advance(n) {
      html = html.substring(n);
    }

    function parseStartTag() {
      var start = html.match(startTagOpen); // console.log(start); start是一个数组，打印查看

      if (start) {
        ({
          tagName: start[1],
          //标签名(其实对于start数组我们可以将值打印出来看)
          attrs: [] //标签属性

        });
        advance(start[0].length); //前进：将已经匹配了的删除
        // console.log(match, html);
      }

      return false; //不是开始标签
    }

    while (html) {
      // 如果textEnd 为0， 说明是一个开始标签或者 是结束标签(如果是结束标签的话，那么就说明结束标签前面的字符全部被匹配完毕，并且也被删除了，因为我们的匹配会将匹配完的地方逐渐删除掉)
      // 如果textEnd 大于0，说明是这样的： hello</div> , 此时还在匹配文本串
      var textEnd = html.indexOf('<');

      if (textEnd == 0) {
        //如果是开始标签
        parseStartTag();
        break;
      }
    }
  } //对模板进行编译处理


  function compileToFunction(template) {
    // 第一步：将template 转换为 ast语法树
    parseHTML(template); // 第二步：生成render方法（render方法执行后返回的结果就是 虚拟DOM）

    console.log(template);
  }

  /*
   * @Author: Pan Jingyi
   * @Date: 2022-10-04 15:16:44
   * @LastEditTime: 2022-10-04 19:55:48
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


        if (template) {
          //这里需要对模板进行编译
          var render = compileToFunction(template); //根据template生成一个render函数

          ops.render = render; //挂载render属性
        }
      } //有render就直接获取，我们最终都是要拿到一个render函数


      ops.render; //最终就可以获取render方法
    };
  }

  function Vue(options) {
    //options就是用户的选项
    this._init(options);
  }

  initMixin(Vue); //扩展了init方法

  return Vue;

}));
//# sourceMappingURL=vue.js.map
