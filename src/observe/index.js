import { newArrayProto } from "./array"
import Dep from "./dep"

/*
 * @Author: Pan Jingyi
 * @Date: 2022-10-04 15:33:12
 * @LastEditTime: 2023-01-03 02:20:08
 */
class Observer{
  constructor(data){
    //给数组本身增加dep,如果数组新增了某一项，就要触发dep更新
    //给对象增加dep，如果后序用户增加了属性，也要触发dep更新

    //要给每个对象都增加收集功能
    this.dep = new Dep()



    //Object.defineProperty只能劫持已经存在的属性（vue里面会为此单独写一些api $set $delete）
    
    Object.defineProperty(data, '__ob__', {
      value: this,
      enumerable: false //将__ob__变成不可枚举型（循环时无法获取到）
    })
    //上面就是一个定义属性，不必要再写 data.__ob__ = this; 这句代码

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


    if(Array.isArray(data)){
      //这里我们可以重写数组中的方法，7个变异方法是可以修改数组本身的
      data.__proto__ = newArrayProto //保留数组原有的特性，并且重写部分方法
      this.observeArray(data) //如果数组中放的是对象，可以监控到对象的变化
    }else{
      this.walk(data)
    }
    
  }

  walk(data){ //循环对象，对象属性依次劫持
    // 重新定义属性
    Object.keys(data).forEach(key => defineReactive(data, key, data[key]))
  }

  observeArray(data){
    // 对数组中的是对象的某一项进行观测
    data.forEach(item => observe(item))
  }
}

// 如果get取值是数组，就进行依赖收集(这里就是对数组中的数组再次进行依赖收集)
function dependArray(value){
  for(let i=0; i < value.length; i++){
    let current = value[i];
    current.__ob__ && current.__ob__.dep.depend();
    if(Array.isArray(current)){
      dependArray(current)
    }
  }
}

// 数据劫持
// 执行get时会进行dep和watcher的收集，在执行set时，让dep更新
export function defineReactive(target, key, value){
  let childOb = observe(value); //递归进行：如果属性是对象那就继续进行代理
  //childOb中就有一个dep属性 用来收集依赖
  let dep = new Dep(); //每一个属性都增加一个dep 
  Object.defineProperty(target, key, {
    get(){ //取值的时候 执行get
      if(Dep.target){
        dep.depend(); //让这个属性的收集器记住当前的watcher
        if(childOb){
          childOb.dep.depend();//让数组和对象本身也实现依赖收集

          if(Array.isArray(value)){ //处理数组中的数组
            dependArray(value)
          }
        }
      }
      return value
    },
    set(newValue){ //修改的时候，会执行set
      if(newValue){
        if(newValue === value) return
        observe(value); //递归进行：如果设置的值还是对象那就继续进行代理
        value = newValue
        dep.notify(); //更新dep,通知watcher进行更新
      }
    }
  })
}

export function observe(data) {
  //对对象进行劫持
  if(typeof data !== 'object' || data == null){
    return; //只对对象进行劫持
  }

  if(data.__ob__ instanceof Observer){ //说明这个对象被代理过了
    return data.__ob__;
  }
  //如果一个对象被劫持过了，那就不需要再被劫持了（要判断一个对象是否被劫持过，可以增添一个实例，用实例来判断是否被劫持过）

  return new Observer(data); //我们返回的是一个被劫持过的对象
}