<template>
  <div id="app" data-app>
    <img alt="Vue logo" src="./assets/logo.png" class="logo">
    <div class="header">
      <h2>{{ msg }}</h2>
    </div>
    <Birds></Birds>
    <div class="footer">
      <a class="bigml_link" :href="bigmlUrl" target="_blank"><span></span></a>
    </div>
  </div>
</template>

<script>
import Birds from './components/Birds.vue';
export default {
  name: 'App',
  data: function() {
    return {
      msg: "Vue.js and bounding boxes with D3",
      bigmlUrl: "https://bigml.com",
    }
  },
  components: {
    Birds
  }
};

</script>
<style>
  @import "./assets/style.css";
</style>
