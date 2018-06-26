import Mue from '../src'

const template = `
  <p>{{world}}</p>
  <h2> Welcome {{user.firstName}} <span>{{user.lastName}}</span>
  <input type="text" v-model="user.lastName"><br/>
  <button v-on:click="sayHi">change model</button>
`
/* eslint-disable-next-line */
export default new Mue({
  el: '#app',
  data: {
    world: 'Hello, World!',
    user: {
      firstName: 'Single',
      lastName: 'Zhou'
    }
  },
  template,
  computed: {
    fullName () {
      return this.user.firstName + ' ' + this.user.lastName
    }
  },
  methods: {
    sayHi () {
      this.world = 'Hi, everybody!'
    }
  }
})
