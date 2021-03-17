<template>
  <v-app class="app">
    <div class="header">
      <img alt="Vue logo" src="./assets/logo.png" class="logo" />
      <h2 class="mt-2">{{ msg }}</h2>
    </div>
    <Birds></Birds>
    <!-- <router-link to="/user/123456789">Go to user (test)</router-link>
    <router-view></router-view> -->
    <div class="footer">
      <a class="bigml_link" :href="bigmlUrl" target="_blank"><span></span></a>
    </div>
  </v-app>
</template>

<script>
import Birds from './components/Birds.vue'

export default {
  name: 'App',
  components: {
    Birds
  },
  data: function () {
    return {
      msg: 'Vue.js and bounding boxes with D3',
      bigmlUrl: 'https://bigml.com'
    }
  }
}
</script>

<style lang="sass">
@import './css/style.css'
</style>
