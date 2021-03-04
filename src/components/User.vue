<template>
  <div>
    The user is {{ $route.params.name }}
    <router-view></router-view>
  </div>
</template>
<script>
/*export default {
  watch: {
    $route: function (to, from) {
      console.log(to, from)
    }
  }
}*/
</script>
