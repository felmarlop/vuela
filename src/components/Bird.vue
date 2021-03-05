<template>
  <div class="image_wrapper">
    <div class="zoom_wrapper">
      <transition name="image-fade" @afterEnter="initHandlers">
        <img :src="birdUrl" :style="styles" @load="loaded" @error="error" @click="openModal" v-show="isLoaded" />
      </transition>
    </div>
    <div class="loading" v-if="isError">Error happened loading the image...</div>
    <div class="loading" v-else v-show="!isLoaded">Loading...</div>
  </div>
</template>

<script>
import * as d3 from 'd3'

const DEFAULT_ZOOM = 1
const ZOOM_MAX = 8
const ZOOM_MIN = 0.01

function zoom(cpnt, imgWrapper) {
  return d3
    .zoom()
    .scaleExtent([ZOOM_MIN, ZOOM_MAX])
    .on('zoom', function (ev) {
      let wheel = ev.sourceEvent && ev.sourceEvent['type'] == 'wheel',
        mousemove = ev.sourceEvent && ev.sourceEvent['type'] == 'mousemove',
        transform = ev.transform,
        k = transform['k'],
        x = wheel ? cpnt.transform['x'] : transform['x'],
        y = wheel ? cpnt.transform['y'] : transform['y']

      cpnt.transform = { k: k, x: x, y: y }
      cpnt.$emit('set-zoom', k)

      d3.select(imgWrapper)
        .transition()
        .duration(wheel || mousemove ? 0 : 200)
        .style('transform', 'translate(' + x + 'px,' + y + 'px) scale(' + k + ')')

      d3.select(imgWrapper.parentElement).style('cursor', 'all-scroll')
      d3.select('rect.overlay').style('cursor', 'all-scroll')
    })
    .on('end', function (ev) {
      d3.select(imgWrapper.parentElement).style('cursor', 'default')
      d3.select('rect.overlay').style('cursor', 'default')
      if (ev.sourceEvent) {
        d3.select(imgWrapper.parentElement).call(
          zoom(cpnt, imgWrapper).transform,
          d3.zoomIdentity.translate(cpnt.transform['x'], cpnt.transform['y']).scale(cpnt.transform['k'])
        )
      }
    })
}

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
    zoom: {
      type: Number,
      default: DEFAULT_ZOOM
    },
    raw: Boolean,
    expanded: Boolean
  },
  data: function () {
    return {
      img: null,
      isLoaded: false,
      isError: false,
      transform: { k: DEFAULT_ZOOM, x: 0, y: 0 }
    }
  },
  computed: {
    birdUrl: function () {
      return this.raw ? this.bird.url.replace('image', 'image/raw') : this.bird.url
    }
  },
  watch: {
    zoom: function (val) {
      if (typeof val !== 'number' || val < ZOOM_MIN) val = ZOOM_MIN
      if (val > ZOOM_MAX) val = ZOOM_MAX
      let imgWrapper = this.img.parentElement
      d3.select(imgWrapper.parentElement).call(
        zoom(this, imgWrapper).transform,
        d3.zoomIdentity.translate(this.transform['x'], this.transform['y']).scale(val)
      )
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
    initHandlers: function (el) {
      this.img = el
      this.transform = { k: DEFAULT_ZOOM, x: 0, y: 0 }
      if (!el || !this.expanded) return false

      // Image zoom
      let imgWrapper = el.parentElement
      d3.select(imgWrapper.parentElement).call(zoom(this, imgWrapper)).on('dblclick.zoom', null)
      d3.select(imgWrapper).style('transform', 'scale(' + DEFAULT_ZOOM + ',' + DEFAULT_ZOOM + ')')

      // Bird regions
      let regions = this.bird.regions || []
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
        .data(regions)
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
    resetZoom: function () {
      if (this.transform.k == DEFAULT_ZOOM && !this.transform.x && !this.transform.y) return false
      let imgWrapper = this.img.parentElement
      this.transform = { k: DEFAULT_ZOOM, x: 0, y: 0 }
      d3.select(imgWrapper.parentElement).call(
        zoom(this, imgWrapper).transform,
        d3.zoomIdentity.translate(this.transform['x'], this.transform['y']).scale(DEFAULT_ZOOM)
      )
      this.$emit('set-zoom', DEFAULT_ZOOM)
    },
    error: function () {
      this.isError = true
    }
  }
}
</script>
