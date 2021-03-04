import App from './App.vue'
import Vue from 'vue'
import router from './router'
import vuetify from './plugins/vuetify'

Vue.config.productionTip = false

new Vue({
  el: '#app',
  vuetify,
  router,
  render: h => h(App)
})
