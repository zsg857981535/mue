//  订阅器
let uid = 0

export default class Dep {
  constructor () {
    this.id = uid++
    this.subs = [] // 订阅者
  }

  // 添加订阅者
  addSub (sub) {
    this.subs.push(sub)
  }

  depend () {
    Dep.target.addDep(this)
  }

  removeSub (sub) {
    let isExisted = this.subs.includes(sub)
    if (isExisted) {
      this.subs.splice(sub)
    }
  }

  notify () {
    this.subs.forEach((sub) => {
      sub.update()
    })
  }
}

Dep.target = null
