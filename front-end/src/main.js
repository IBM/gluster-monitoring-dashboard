/* eslint-disable */

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

Vue.config.productionTip = false

Vue.use(require('vue-cookies'))

var passwordHash = require('password-hash')
var jwt = require('jsonwebtoken')

Vue.prototype.$passwordHash = passwordHash
Vue.prototype.$jwt = jwt

import Buefy from 'buefy'
import 'buefy/dist/buefy.css'

Vue.use(Buefy)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
