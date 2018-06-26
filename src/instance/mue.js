import Watcher from '../core/watcher'
import observe from '../core/observer'
import Compile from '../core/compile'

// mvvm
class Mue {
  constructor (options = {}) {
    this.$options = options
    let data = this.$data = this.$options.data

    // 数据代理, 实现 vm.xxx -> vm.$data.xxx
    Object.keys(data).forEach(key => {
      this._proxyData(key)
    })
    // 初始化计算属性
    this._initComputed()
    // 监听数据
    observe(data, this)
    // 编译dom
    this.$compile = new Compile(options.el || document.body, this)
  }

  $watch (key, cb, options) {
    /* eslint-disable-next-line */
    new Watcher(this, key, cb)
  }

  _proxyData (key, setter, getter) {
    let me = this
    setter = setter || Object.defineProperty(me, key, {
      configurable: false,
      enumerable: true,
      get: function proxyGetter () {
        return me.$data[key]
      },
      set: function proxySetter (newVal) {
        me.$data[key] = newVal
      }
    })
  }

  _initComputed () {
    let me = this
    let computed = this.$options.computed

    if (typeof computed === 'object') {
      Object.keys(computed).forEach(key => {
        Object.defineProperty(me, key, {
          get: typeof computed[key] === 'function'
            ? computed[key]
            : computed[key].get,
          set: function () {}      
        })
      })
    }
  }
}
export default Mue
