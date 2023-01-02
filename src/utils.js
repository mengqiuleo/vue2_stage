/*
 * @Author: Pan Jingyi
 * @Date: 2023-01-03 03:45:08
 * @LastEditTime: 2023-01-03 03:49:17
 */
// 静态方法
const starts = {} //策略对象
const LIFECYCLE = [
  "beforeCreate",
  "created"
]
// 循环给每一个属性设置合并策略
LIFECYCLE.forEach(hook => {
  starts[hook] = function(p, c){
    if(c){
      if(p){ //父亲和儿子都有
        return p.concat(c)
      } else { //如果儿子有，父亲没有，用儿子的
        return [c]
      }
    } else { // 只有父亲
      return p
    }
  }
})


export function mergeOptions(parent, child){ //如果父亲为空，以儿子为准
  const options = {}

  // 这里是需要父亲和儿子的属性全部都遍历一遍，儿子的属性优先，即儿子可以覆盖父亲
  // 对于一个属性，不论在父亲还是儿子中出现，都会以儿子优先
  for(let key in parent){ //先循环老的
    mergeField(key)
  }
  for(let key in child){ //后循环新的
    if(!parent.hasOwnProperty(key)){ // 如果老的没有，而新的有，那就合并
      mergeField(key)
    }
  }
  function mergeField(key){
    // 策略模式：我们先定义一些策略
    if(starts[key]){ //如果有策略，使用策略
      options[key] = starts[key](parent[key], child[key])
    } else { //没有策略，走默认
      options[key] = child[key] || parent[key] //儿子的属性优先
    }

  }

  return options
}