<template>
  <div class="image_wrapper">
    <div class="zoom_wrapper">
      <transition name="image-fade" @afterEnter="init">
        <img :src="birdUrl" :style="styles" @load="loaded" @error="error" @click="openModal" v-show="isLoaded" />
      </transition>
    </div>
    <div class="loading" v-if="isError">Error happened loading the image...</div>
    <div class="loading" v-else v-show="!isLoaded">Loading...</div>
  </div>
</template>

<script>
import * as d3 from 'd3'

d3.selection.prototype.moveToFront = function () {
  return this.each(function () {
    this.parentNode.appendChild(this)
  })
}

const DEFAULT_ZOOM = 1
const ZOOM_MAX = 8
const ZOOM_MIN = 0.01

// Method to update elements binded to a region
function updateRegionElements(imgWrapper) {
  let height = 18,
    padding = 5,
    radius = 3,
    margin = 5,
    textLimit = 13,
    rectLimit = 0,
    rg,
    txt,
    res

  d3.selectAll('text.region_label')
    .attr('x', function (_, i) {
      rg = d3.select(imgWrapper.querySelectorAll('rect.region[index="' + i + '"]')[0])
      return parseFloat(rg.attr('x')) + padding
    })
    .attr('y', function (_, i) {
      rg = d3.select(imgWrapper.querySelectorAll('rect.region[index="' + i + '"]')[0])
      res = parseFloat(rg.attr('y')) - padding - margin
      if (res < textLimit) res = textLimit
      return res
    })
    .style('opacity', 1)

  d3.selectAll('rect.region_label_background')
    .attr('rx', radius)
    .attr('ry', radius)
    .attr('x', function (_, i) {
      rg = d3.select(imgWrapper.querySelectorAll('rect.region[index="' + i + '"]')[0])
      return parseFloat(rg.attr('x'))
    })
    .attr('y', function (_, i) {
      rg = d3.select(imgWrapper.querySelectorAll('rect.region[index="' + i + '"]')[0])
      res = parseFloat(rg.attr('y')) - height - margin
      if (res < rectLimit) res = rectLimit
      return res
    })
    .attr('width', function (_, i) {
      txt = imgWrapper.querySelectorAll('text.region_label[index="' + i + '"]')[0]
      return txt.getBoundingClientRect().width + 2 * padding
    })
    .attr('height', height)
    .transition()
    .style('opacity', 1)

  d3.selectAll('text.region_label').moveToFront()
}

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
      this.$emit('image-loading')
      return this.raw ? this.bird.url.replace('image', 'image/raw') : this.bird.url
    }
  },
  watch: {
    zoom: function (val) {
      if (!this.img) return false
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
    init: function (el) {
      this.img = el
      this.transform = { k: DEFAULT_ZOOM, x: 0, y: 0 }
      if (!el || !this.expanded) return false

      // Image zoom
      let imgWrapper = el.parentElement
      d3.select(imgWrapper.parentElement).call(zoom(this, imgWrapper)).on('dblclick.zoom', null)

      // Image overlay
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

      // Image regions
      _g.selectAll('rect.region')
        .data(regions)
        .enter()
        .append('rect')
        .attr('index', function (_, i) {
          return i
        })
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
        .on('end', function () {
          updateRegionElements(imgWrapper)
        })

      // Image region labels
      _g.selectAll('text.region_label')
        .data(regions)
        .enter()
        .append('text')
        .attr('index', function (_, i) {
          return i
        })
        .attr('class', 'region_label')
        .style('font-size', '0.98em')
        .style('stroke', 'rgb(255, 255, 255)')
        .style('color', 'rgb(255, 255, 255)')
        .style('fill', 'rgb(255, 255, 255)')
        .style('stroke-width', 0)
        .style('opacity', 0)
        .text(function (d) {
          return d[4] || ''
        })
      _g.selectAll('rect.region_label_background')
        .data(regions)
        .enter()
        .append('rect')
        .attr('index', function (_, i) {
          return i
        })
        .attr('class', 'region_label_background')
        .attr('stroke', 'rgb(255, 255, 255)')
        .attr('stroke-width', 1)
        .attr('fill', 'rgb(0, 0, 0)')
        .style('opacity', 0)

      _g.append('rect').attr('class', 'overlay').attr('width', el.width).attr('height', el.height).style('fill', 'none')
    },
    resetZoom: function () {
      if (!this.img) return false
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
