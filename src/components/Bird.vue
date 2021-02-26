<template>
  <div class="image_wrapper">
    <transition name="image-fade">
        <img v-show="isLoaded" :src="url" @load="loaded">
    </transition>
    <div v-show="!isLoaded" class="loading">Loading...</div>
  </div>
</template>

<script>
export default {
    name: 'Bird',
    props: ['url'],
    data: function() {
        return {
            isLoaded: false
        }
    },
    methods: {
        loaded: function() {
            this.isLoaded = true
        }
    }
};
</script>