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
const REGIONS_ALLOWED = 40
const CATEGORY_COLORS = [
  '#1f77b4',
  '#ff7f0e',
  '#2ca02c',
  '#d62728',
  '#9467bd',
  '#8c564b',
  '#e377c2',
  '#7f7f7f',
  '#bcbd22',
  '#17becf',
  '#aec7e8',
  '#ffbb78',
  '#98df8a',
  '#ff9896',
  '#c5b0d5',
  '#c49c94',
  '#f7b6d2',
  '#c7c7c7',
  '#dbdb8d',
  '#9edae5',
  '#393b79',
  '#5254a3',
  '#6b6ecf',
  '#9c9ede',
  '#637939',
  '#8ca252',
  '#b5cf6b',
  '#cedb9c',
  '#8c6d31',
  '#bd9e39',
  '#e7ba52',
  '#e7cb94',
  '#843c39',
  '#ad494a',
  '#d6616b',
  '#e7969c',
  '#7b4173',
  '#a55194',
  '#ce6dbd',
  '#de9ed6',
  '#3182bd',
  '#6baed6',
  '#9ecae1',
  '#c6dbef',
  '#e6550d',
  '#fd8d3c',
  '#fdae6b',
  '#fdd0a2',
  '#31a354',
  '#74c476',
  '#a1d99b',
  '#c7e9c0',
  '#756bb1',
  '#9e9ac8',
  '#bcbddc',
  '#dadaeb',
  '#636363',
  '#969696',
  '#bdbdbd',
  '#d9d9d9'
]

let initPoint = null

// Method to update elements binded to a region
function updateRegionElements(img) {
  let imgWrapper = img.parentElement,
    height = 18,
    padding = 5,
    radius = 3,
    margin = 5,
    closeMargin = 2,
    textLimit = 13,
    rectLimit = 0,
    deleteSize = 15,
    rg,
    txt,
    res,
    closeX,
    idx
  d3.selectAll('text.region_label')
    .classed('to_remove', function (d) {
      return !d[4]
    })
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
    .classed('to_remove', function (d) {
      return !d[4]
    })
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
      return txt.getComputedTextLength() + 2 * padding
    })
    .attr('height', height)
    .transition()
    .style('opacity', 1)
  d3.selectAll('.to_remove').remove()

  d3.selectAll('.delete_region_wrapper')
    .attr('x', function (_, i) {
      rg = d3.select(imgWrapper.querySelectorAll('rect.region[index="' + i + '"]')[0])
      closeX = parseFloat(rg.attr('x')) + parseFloat(rg.attr('width')) + closeMargin
      if (closeX + deleteSize >= img.width) closeX = img.width - deleteSize
      return closeX
    })
    .attr('y', function (_, i) {
      rg = d3.select(imgWrapper.querySelectorAll('rect.region[index="' + i + '"]')[0])
      return parseFloat(rg.attr('y'))
    })
    .attr('width', deleteSize)
    .attr('height', deleteSize)

  // Sort elements
  d3.selectAll('rect.region').each(function () {
    idx = d3.select(this).attr('index')
    d3.select(imgWrapper.querySelectorAll('rect.region_label_background[index="' + idx + '"]')[0]).moveToFront()
    d3.select(imgWrapper.querySelectorAll('text.region_label[index="' + idx + '"]')[0]).moveToFront()
  })
  if (!d3.select('rect.adding').empty()) d3.select('rect.adding').moveToFront()
  d3.select('rect.overlay').moveToFront()
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

      d3.selectAll('.cross_line').style('display', 'none')
      if (d3.select('rect.adding').empty()) initPoint = null

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
      d3.select('rect.overlay').style('cursor', 'crosshair')
      if (initPoint) {
        cpnt.disableEditingMode()
        cpnt.addNewRegion()
      }
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
    selectedLabel: {
      type: String,
      default: ''
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
      let cpnt = this
      cpnt.img = el
      cpnt.transform = { k: DEFAULT_ZOOM, x: 0, y: 0 }
      if (!el || !cpnt.expanded) return false

      // Image overlay
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

      cpnt.updateRegions(cpnt.bird.regions || [])

      // Cross lines
      _g.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', el.height)
        .attr('stroke', '#919191')
        .attr('class', 'cross_line y')
        .style('display', 'none')
      _g.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', el.width)
        .attr('y2', 0)
        .attr('stroke', '#919191')
        .attr('class', 'cross_line x')
        .style('display', 'none')
      _g.append('rect')
        .attr('class', 'overlay')
        .attr('width', el.width)
        .attr('height', el.height)
        .style('fill', 'none')
        .on('mousedown.overlay', function (ev) {
          if (d3.select('rect.adding').empty()) {
            initPoint = d3.pointer(ev)
          } else {
            cpnt.finishRegion()
          }
        })
        .on('mousemove.overlay', function (event) {
          let pointer = d3.pointer(event)
          d3.selectAll('.cross_line').style('display', 'block')
          d3.select('.cross_line.x').attr('y1', pointer[1]).attr('y2', pointer[1])
          d3.select('.cross_line.y').attr('x1', pointer[0]).attr('x2', pointer[0])
          if (initPoint) {
            let addingRect = d3.select('rect.adding')
            if (pointer[0] >= initPoint[0]) {
              addingRect.attr('width', pointer[0] - initPoint[0])
            } else {
              addingRect.attr('x', pointer[0]).attr('width', initPoint[0] - pointer[0])
            }
            if (pointer[1] >= initPoint[1]) {
              addingRect.attr('height', pointer[1] - initPoint[1])
            } else {
              addingRect.attr('y', pointer[1]).attr('height', initPoint[1] - pointer[1])
            }
          }
        })
        .on('mouseout.overlay', function () {
          d3.selectAll('.cross_line').style('display', 'none')
        })
    },
    updateRegions: function (data) {
      let cpnt = this,
        _g = d3.select('#g_'),
        imgWrapper = cpnt.img.parentElement,
        validRegions = [],
        labelSet = [],
        ic = 0,
        currentRg,
        colorFn

      while (ic < data.length) {
        currentRg = data[ic]
        if (currentRg.length == 5) {
          validRegions.push(currentRg)
          if (currentRg[4]) labelSet.push(currentRg[4])
        }
        ic++
      }
      colorFn = this.getColorFn(labelSet)

      // Image regions
      let regs = _g.selectAll('rect.region').data(validRegions)
      regs
        .enter()
        .append('rect')
        .attr('index', function (_, i) {
          return i
        })
        .attr('class', 'region')
        .classed('adding', function (d) {
          return !d[4]
        })
        .attr('stroke', function (d) {
          return colorFn(d[4] || cpnt.selectedLabel)
        })
        .attr('fill', function (d) {
          return colorFn(d[4] || cpnt.selectedLabel)
        })
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
          // Image zoom
          d3.select(imgWrapper.parentElement).call(zoom(cpnt, imgWrapper)).on('dblclick.zoom', null)
          updateRegionElements(cpnt.img)
        })
      regs.exit().remove()

      // Image region labels
      let rglabels = _g.selectAll('text.region_label').data(validRegions)
      rglabels
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
      rglabels.exit().remove()
      let lbBackgrounds = _g.selectAll('rect.region_label_background').data(validRegions)
      lbBackgrounds
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
      lbBackgrounds.exit().remove()
    },
    addNewRegion: function () {
      if (!d3.select('rect.adding').empty() || !initPoint || !this.selectedLabel) return false

      let x = initPoint[0],
        y = initPoint[1]
      if (x > this.img.width || y > this.img.height) return false
      if (d3.selectAll('rect.region').size() >= REGIONS_ALLOWED) return false

      let data = d3.selectAll('rect.region').data()
      data.push([x, y, 0, 0, ''])
      this.updateRegions(data)
    },
    finishRegion: function () {
      let data = d3.selectAll('rect.region').data(),
        addingRect = d3.select('rect.adding'),
        newRegion = [
          parseInt(addingRect.attr('x')),
          parseInt(addingRect.attr('y')),
          parseInt(addingRect.attr('width')),
          parseInt(addingRect.attr('height')),
          this.selectedLabel
        ]

      initPoint = null
      addingRect.classed('adding', false)

      data = data.slice(0, -1)
      if (newRegion[2] && newRegion[3] && this.selectedLabel) {
        data.push(newRegion)
      }
      this.updateRegions(data)
      updateRegionElements(this.img)
    },
    removeRegionByIndex(idx) {
      let data = d3.selectAll('rect.region').data()
      data.splice(idx, 1)
      this.updateRegions(data)
    },
    enableEditingMode: function () {
      let cpnt = this,
        _g = d3.select('#g_'),
        idx

      _g.select('rect.overlay').classed('editing', true)

      // rects for resizing
      _g.selectAll('rect.region').each(function () {
        idx = d3.select(this).attr('index')
        // Icon to remove the region
        _g.append('svg:foreignObject')
          .attr('index', idx)
          .attr('class', 'delete_region_wrapper')
          .on('mousedown', function () {
            var idx = d3.select(this).attr('index')
            cpnt.removeRegionByIndex(idx)
          })
          .append('xhtml:i')
          .attr('class', 'delete_region')
        updateRegionElements(cpnt.img)
      })
      _g.selectAll('.region_label,.region_label_background,.delete_region_wrapper').moveToFront()
    },
    disableEditingMode: function () {
      let _g = d3.select('#g_')
      _g.select('rect.overlay').classed('editing', false).moveToFront()
      _g.selectAll('.region_label_background,.region_label').moveToFront()
      _g.selectAll('.delete_region_wrapper').remove()
    },
    getColorFn: function (labels) {
      return d3.scaleOrdinal().range(CATEGORY_COLORS).domain(labels)
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
