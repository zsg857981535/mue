import Dep from './dep'

// 返回一个观察者
const observe = (value, vm) => {
  if (!value || typeof value !== 'object') {
    return
  }
  return new Observer(value)
}
// 观察者，定义响应式的data
class Observer {
  constructor (data) {
    this.data = data
    this.walk(data)
  }
  // 遍历每一个key值
  walk (data) {
    Object.keys(data).forEach(key => {
      this.convert(key, data[key])
    })
  }
  convert (key, val) {
    this.defineReactive(this.data, key, val)
  }
  // 定义响应式的数据
  defineReactive (data, key, val) {
    let dep = new Dep()
    /* eslint-disable-next-line */
    let childObj = observe(val)

    Object.defineProperty(data, key, {
      enumerable: true, // 可枚举
      configurable: false, // 不能再define
      get () {
        if (Dep.target) {
          dep.depend()
        }
        return val
      },
      set (newVal) {
        if (newVal === val) {
          return
        }
        val = newVal
        // 新的值是object的话，进行监听
        childObj = observe(newVal)
        // 通知订阅者
        dep.notify()
      }
    })
  } 
}

export default observe
