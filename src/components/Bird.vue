<template>
  <div class="image_wrapper">
    <transition name="image-fade" @afterEnter="addRegions">
      <img :src="birdUrl" :style="styles" @load="loaded" @error="error" @click="openModal" v-show="isLoaded" />
    </transition>
    <div class="loading" v-if="isError">Error happened loading the image...</div>
    <div class="loading" v-else v-show="!isLoaded">Loading...</div>
  </div>
</template>

<script>
import * as d3 from 'd3'
export default {
  name: 'Bird',
  props: {
    bird: {
      type: Object,
      default: null
    },
    styles: {
      type: Object,
      default: null
    },
    raw: Boolean,
    expanded: Boolean
  },
  data: function () {
    return {
      isLoaded: false,
      isError: false,
      brightness: 1,
      contrast: 1
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
      this.$emit('image-loaded')
    },
    addRegions: function (el) {
      if (!el || !this.expanded) return false
      let _g = d3
        .select(el.parentElement)
        .append('svg')
        .attr('id', 'svg_')
        .attr('class', 'overlay_wrapper')
        .attr('width', el.width)
        .attr('height', el.height)
        .style('top', el.offsetTop)
        .style('left', el.offsetLeft)
        .append('g')
        .attr('id', 'g_')
      _g.selectAll('rect.region')
        .data(this.bird.regions)
        .enter()
        .append('rect')
        .attr('class', 'region')
        .attr('stroke', '#284400')
        .attr('fill', '#284400')
        .attr('stroke-width', '2px')
        .attr('fill-opacity', 0.2)
        .attr('x', function (d) {
          return d[0] + d[2] / 2
        })
        .attr('y', function (d) {
          return d[1] + d[3] / 2
        })
        .transition()
        .attr('x', function (d) {
          return d[0]
        })
        .attr('y', function (d) {
          return d[1]
        })
        .attr('width', function (d) {
          return d[2]
        })
        .attr('height', function (d) {
          return d[3]
        })
      _g.append('rect').attr('class', 'overlay').attr('width', el.width).attr('height', el.height).style('fill', 'none')
    },
    error: function () {
      this.isError = true
    }
  }
}
</script>
