/*
 * @Author: Pan Jingyi
 * @Date: 2022-10-05 21:24:29
 * @LastEditTime: 2022-10-06 18:31:50
 */

let id = 0;
class Dep {
  constructor(){ 
    this.id = id++;
    this.subs = []; //这里存放这当前属性对应的watcher有哪些
  }
  depend(){ //我们希望dep和watcher实现双向收集
    Dep.target.addDep(this); //Dep.target指的是当前的watcher，然后调用watcher的addDep方法
  }
  addSub(watcher){
    this.subs.push(watcher); //当前dep收集当前watcher
  }
  notify(){ //通知该属性的所有watcher都要进行更新
    this.subs.forEach(watcher => watcher.update());
  }
}
Dep.target = null; //暴露一个属性用来连接dep和watcher

let stack = [];
// 存储计算属性的watcher
export function pushTarget(watcher){
  stack.push(watcher);
  Dep.target = watcher;
}
export function popTarget(){
  stack.pop();
  Dep.target = stack[stack.length-1];
}

export default Dep;