<template>
  <div class="image_wrapper">
    <img :src="url" alt="image">
  </div>
</template>

<script>
export default {
  name: 'Bird',
  props: ['url']
};
</script>