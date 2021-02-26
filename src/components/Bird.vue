<template>
  <div class="image_wrapper">
    <transition name="image-fade">
        <img v-show="isLoaded" :src="birdUrl" @load="loaded" @error="error" @click="openModal">
    </transition>
    <div v-if="isError" class="loading">Error happened loading the image...</div>
    <div v-else v-show="!isLoaded" class="loading">Loading...</div>
  </div>
</template>

<script>
export default {
    name: 'Bird',
    props: ['bird', 'raw', 'dialog'],
    data: function() {
        return {
            isLoaded: false,
            isError: false
        }
    },
    computed: {
        birdUrl: function() {
            return (this.raw) ?
                this.bird.url.replace('image', 'image/raw') : this.bird.url
        }
    },
    methods: {
        openModal: function() {
            console.log(this.dialog);
            if (this.dialog) return false;
            this.$emit('openModal', this.bird)
        },
        loaded: function() {
            this.isLoaded = true
        },
        error: function() {
            console.log("ssss")
            this.isError = true
        }
    }
};
</script>