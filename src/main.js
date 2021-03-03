import App from './App.vue'
import router from './router'
import Vue from 'vue'
import vuetify from './plugins/vuetify'

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  vuetify,
  render: h => h(App)
})
