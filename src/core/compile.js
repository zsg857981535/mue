import Watcher from "./watcher"

// 值更新函数
const updater = {
  textUpdater (node, value) {
    node.textContent = typeof value == 'undefined' ? '' : value
  },

  htmlUpdater (node, value) {
    node.innerHtml = typeof value == 'undefined' ? '' : value
  },

  classUpdater (node, value, oldValue) {
    let className = node.className
    className = className.replace(oldValue, '').replace(/\s$/, '')

    let space = className && String(value) ? ' ' : ''
    node.className = className + space + value
  },

  modelUpdater (node, value, oldValue) {
    node.value = typeof value == 'undefined' ? '' : value
  }
}
// 指令处理集合
const compileUtil = {
  text (node, vm, exp) {
    this.bind(node, vm, exp, 'text')
  },

  html (node, vm, exp) {
    this.bind(node, vm, exp, 'html')
  },

  model (node, vm, exp) {
    this.bind(node, vm, exp, 'model')

    let val = this._getVMVal(vm, exp)
    node.addEventListener('input', (e) => {
      let newValue = e.target.value
      if (val === newValue) return

      this._setVMVal(vm, exp, newValue)
      val = newValue
    })
  },

  class (node, vm, exp) {
    this.bind(node, vm, exp, 'class')
  },

  bind (node, vm, exp, dir) {
    let updaterFn = updater[dir + 'Updater']

    updaterFn && updaterFn(node, this._getVMVal(vm, exp))
    /* eslint-disable-next-line */
    new Watcher(vm, exp, (value, oldValue) => { // 新增订阅者，数据变化后只需更新视图指令
      updaterFn && updaterFn(node, value, oldValue)
    })
  },

  // 事件处理
  eventHandler (node, vm, exp, dir) {
    let eventType = dir.split(':')[1]
    let fn = vm.$options.methods && vm.$options.methods[exp]

    if (eventType && fn) {
      node.addEventListener(eventType, fn.bind(vm), false)
    }
  },
  // e.g: obj.a.b
  _getVMVal (vm, exp) {
    let val = vm
    exp = exp.split('.')
    exp.forEach(k => {
      val = val[k]
    })

    return val
  },

  _setVMVal (vm, exp, value) {
    let val = vm
    exp = exp.split('.')
    exp.forEach((k, i) => {
      // 非最后一个key， 更新val的值, { a: { b: { c: 1 } }, a.b.c = 2 -> val = { b: { c: 1} } -> val = {c : 1} -> val['c'] = 2
      if (i < exp.length - 1) {
        val = val[k]
      } else {
        val[k] = value
      }
    })
  }

}

// 编译器
export default class Compile {
  constructor (el, vm) {
    this.$vm = vm
    this.$el = this.isElementNode(el) ? el : document.querySelector(el)
    this.$template = vm.$options.template

    if (this.$el) {
      this.$fragment = this.$template ? this.template2Fragment(this.$template) : this.node2Fragment(this.$el)
      this.init()
      this.$el.appendChild(this.$fragment)
    }
  }

  createFragment (html) {
    let child
    let fragment = document.createDocumentFragment()
    let el = document.createElement('div')
    el.innerHTML = html
    /* eslint-disable-next-line */
    while (child = el.firstChild) {
      fragment.appendChild(child)
    }
    return fragment
  }
  node2Fragment (el) {
    let fragment = document.createDocumentFragment()
    let child

    /* eslint-disable-next-line */
    while (child = el.firstChild) { // 原生节点拷贝到fragment
      // appendChild将元素从dom上移到fragment
      fragment.appendChild(child)
    }
    return fragment
  }

  template2Fragment (template) {
    let el = template.charAt(0) === '#' ? document.body.querySelector(template) : null
    if (!el) {
      return this.createFragment(template)
    }
    if (el.tagName === 'SCRIPT') {
      return this.createFragment(el.innerHTML)
    } else {
      return this.node2Fragment(el)
    }
  }

  init () {
    this.compileElement(this.$fragment)
  }
 
  compileElement (el) {
    let childNodes = el.childNodes

    childNodes && Array.prototype.slice.call(childNodes).forEach((node) => {
      let text = node.textContent
      // 文本插槽表达式{{}}
      let reg = /\{\{(.*)\}\}/

      if (this.isElementNode(node)) {
        this.compile(node)
      } else if (this.isTextNode(node) && reg.test(text)) {
        this.compileText(node, RegExp.$1)
      }

      if (node.childNodes && node.childNodes.length) {
        this.compileElement(node)
      }
    })
  }

  compile (node) {
    let nodeAttrs = node.attributes

    nodeAttrs && Array.prototype.slice.call(nodeAttrs).forEach((attr) => {
      let attrName = attr.name

      if (this.isDirective(attrName)) {
        let exp = attr.value
        let dir = attrName.substring(2)

        // 事件指令
        if (this.isEventDirective(dir)) {
          compileUtil.eventHandler(node, this.$vm, exp, dir)
        } else {
          // 普通指令
          compileUtil[dir] && compileUtil[dir](node, this.$vm, exp)
        }

        node.removeAttribute(attrName)
      }
    })
  }

  compileText (node, exp) {
    compileUtil.text(node, this.$vm, exp)
  }

  isDirective (attr) {
    return attr.indexOf('v-') == 0
  }

  isEventDirective (dir) {
    return dir.indexOf('on') == 0
  }

  isElementNode (node) {
    return node.nodeType == 1
  }

  isTextNode (node) {
    return node.nodeType == 3
  }
}
