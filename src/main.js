import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import intercept from './http/intercept'

Vue.config.productionTip = false
// Vue.prototype.$intercept = intercept
Vue.prototype.$get = intercept.get
Vue.prototype.$post = intercept.post
Vue.prototype.$put = intercept.put
Vue.prototype.$delete = intercept.delete

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
