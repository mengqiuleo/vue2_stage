/*
 * @Author: Pan Jingyi
 * @Date: 2022-10-04 17:45:37
 * @LastEditTime: 2022-10-04 18:10:33
 */
// 重写数组中的部分方法

let oldArrayProto = Array.prototype; //获取数组的原型

export let newArrayProto = Object.create(oldArrayProto);

let methods = [ //找到所有变异方法
  'push',
  'pop',
  'shift',
  'unshift',
  'reverse',
  'sort',
  'splice'
] //concat slice 都不会改变原数组

methods.forEach(method => {
  //arr.push(1,2,3)
  newArrayProto[method] = function(...args){ //这里重写了数组的方法
    const result = oldArrayProto[method].call(this,...args) //内部调用原来的方法
    
    //我们需要对新增的数据再次进行劫持
    let inserted; //该变量存放新增的数据值

    // 根据newArrayProto的被引用位置：我们可以得知，这里的this应该是 class Observe的实例对象
    let ob = this.__ob__;//这里的ob就是Observe实例，并且它身上有对数组进行观测的observeArray方法

    switch(method){
      case 'push':
      case 'unshift': //arr.unshift(1,2,3)
        inserted = args;
        break;
      case 'splice': //arr.splice(0,1,{a:1})
        inserted = args.slice(2);
      default:
        break;
    }
    console.log('新增的数组的数据：',inserted);
    if(inserted){ //对新增的内容再次进行观测
      //既然要对新增的数据进行观测：那么还是要调用最初监测数组的方法来对新增数据进行观测
      //那个新增的方法在Observe实例的observeArray函数，所以我们要拿到Observe实例
      //怎么拿？ 在Observe类中，我们已经绑定了this到__ob__属性上，并且在这里：根据这里被调用的位置可知，这里的this就是class Observe的实例对象
      //所以，我们直接拿一个变量来承接Observe实例 -> let ob = this.__ob__;(在上面已经声明过了)
    
      //下面就是对新增的数据再次进行观测
      ob.observeArray(inserted);
    }

    return result
  }
})