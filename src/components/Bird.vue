<template>
  <div class="image_wrapper">
    <transition name="image-fade">
      <img :src="birdUrl" @load="loaded" @error="error" @click="openModal" v-show="isLoaded" />
    </transition>
    <div class="loading" v-if="isError">Error happened loading the image...</div>
    <div class="loading" v-else v-show="!isLoaded">Loading...</div>
  </div>
</template>

<script>
export default {
  name: 'Bird',
  props: {
    bird: {
      type: Object,
      default: null
    },
    raw: Boolean,
    expanded: Boolean
  },
  data: function () {
    return {
      isLoaded: false,
      isError: false
    }
  },
  computed: {
    birdUrl: function () {
      return this.raw ? this.bird.url.replace('image', 'image/raw') : this.bird.url
    }
  },
  methods: {
    openModal: function () {
      if (this.expanded) return false
      this.$emit('open-modal', this.bird)
    },
    loaded: function () {
      this.isLoaded = true
    },
    error: function () {
      this.isError = true
    }
  }
}
</script>
