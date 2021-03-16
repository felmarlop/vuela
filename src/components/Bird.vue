<template>
  <div v-click-outside="onClickOutside" class="image_wrapper">
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
import _ from 'lodash'

d3.selection.prototype.moveToFront = function () {
  return this.each(function () {
    this.parentNode.appendChild(this)
  })
}

const DEFAULT_ZOOM = 1
const ZOOM_MAX = 8
const ZOOM_MIN = 0.01
const MAX_IMG_HEIGHT = 600
const REGIONS_ALLOWED = 40
const WRAPPER_DIMENSION = 720
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

// Method to drag a region
function dragged(event, rgD3, cpnt) {
  if (!cpnt.editingMode) return

  let rgData = rgD3.data()[0],
    newX = parseFloat(event.x) - parseFloat(event.subject.x || event.x) + parseFloat(rgD3.attr('x')),
    newY = parseFloat(event.y) - parseFloat(event.subject.y || event.y) + parseFloat(rgD3.attr('y'))
  if (newX < 0) newX = 0
  if (newY < 0) newY = 0

  let rwidth = parseFloat(rgD3.attr('width')),
    rheight = parseFloat(rgD3.attr('height'))
  if (newX + rwidth > cpnt.imgWidth) newX = cpnt.imgWidth - rwidth
  if (newY + rheight > cpnt.imgHeight) newY = cpnt.imgHeight - rheight

  rgD3
    .attr('x', newX)
    .attr('y', newY)
    .data([[newX, newY, rgData[2], rgData[3], rgData[4]]])
  event.subject['x'] = event.x
  event.subject['y'] = event.y
  updateRegionElements(rgD3, cpnt)
}

// Method to resize a region
function resized(event, square, cpnt) {
  let img = cpnt.img,
    imgWrapper = img.parentElement,
    minSize = 1,
    region,
    rgD3,
    label,
    diffx,
    diffy,
    newX,
    newY,
    newW,
    newH,
    rwidth,
    rheight,
    dSquare

  dSquare = d3.select(square)
  region = imgWrapper.querySelectorAll('rect.region[index="' + dSquare.attr('index') + '"]')[0]
  rgD3 = d3.select(region)
  diffx = parseFloat(event.x) - parseFloat(event.subject.x)
  diffy = parseFloat(event.y) - parseFloat(event.subject.y)
  rwidth = parseFloat(rgD3.attr('width'))
  rheight = parseFloat(rgD3.attr('height'))
  if (dSquare.classed('top_left')) {
    newX = diffx + parseFloat(rgD3.attr('x'))
    newY = diffy + parseFloat(rgD3.attr('y'))
    if (newX < 0) {
      newX = 0
      diffx = 0
    }
    if (newY < 0) {
      newY = 0
      diffy = 0
    }
    newW = rwidth - diffx
    newH = rheight - diffy
  } else if (dSquare.classed('bottom_right')) {
    newX = parseFloat(rgD3.attr('x'))
    newY = parseFloat(rgD3.attr('y'))
    newW = rwidth + diffx
    newH = rheight + diffy
  } else if (dSquare.classed('bottom_left')) {
    newX = diffx + parseFloat(rgD3.attr('x'))
    newY = parseFloat(rgD3.attr('y'))
    if (newX < 0) {
      newX = 0
      diffx = 0
    }
    newW = rwidth - diffx
    newH = rheight + diffy
  } else if (dSquare.classed('top_right')) {
    newX = parseFloat(rgD3.attr('x'))
    newY = diffy + parseFloat(rgD3.attr('y'))
    if (newY < 0) {
      newY = 0
      diffy = 0
    }
    newW = rwidth + diffx
    newH = rheight - diffy
  } else {
    return
  }

  // Fix new with and height
  if (newW < minSize) {
    newW = minSize
    newX = parseFloat(rgD3.attr('x'))
  }
  if (newH < minSize) {
    newH = minSize
    newY = parseFloat(rgD3.attr('y'))
  }
  if (newX + newW > cpnt.imgWidth) newW = cpnt.imgWidth - newX
  if (newY + newH > cpnt.imgHeight) newH = cpnt.imgHeight - newY

  // Update region data
  rgD3.attr('x', newX).attr('y', newY).attr('width', newW).attr('height', newH)
  label = rgD3.data()[0][4]
  rgD3.data([[newX, newY, newW, newH, label]])
  event.subject['x'] = event.x
  event.subject['y'] = event.y
  updateRegionElements(rgD3, cpnt)
}

// Method to update elements binded to a region
function updateRegionElements(region, cpnt) {
  let img = cpnt.img,
    imgWrapper = img.parentElement,
    idx = region.attr('index'),
    rgData = region.data()[0],
    txt = imgWrapper.querySelectorAll('text.region_label[index="' + idx + '"]')[0],
    height = 18,
    padding = 5,
    radius = 3,
    margin = 5,
    closeMargin = 2,
    textLimit = 13,
    rectLimit = 0,
    resizesz = 8,
    deleteSize = 15,
    res,
    closeX

  d3.select(txt)
    .attr('x', function () {
      return parseFloat(rgData[0]) + padding
    })
    .attr('y', function () {
      res = parseFloat(rgData[1]) - padding - margin
      if (res < textLimit) res = textLimit
      return res
    })
    .style('display', 'block')
    .style('opacity', function () {
      return rgData && rgData[4] ? 1 : 0
    })
    .text(function (d) {
      return d[4] || ''
    })

  d3.select(imgWrapper.querySelectorAll('rect.region_label_background[index="' + idx + '"]')[0])
    .attr('rx', radius)
    .attr('ry', radius)
    .attr('x', function () {
      return parseFloat(rgData[0])
    })
    .attr('y', function () {
      res = parseFloat(rgData[1]) - height - margin
      if (res < rectLimit) res = rectLimit
      return res
    })
    .attr('width', function () {
      return txt.getComputedTextLength() + 2 * padding
    })
    .attr('height', height)
    .style('display', function () {
      let show = cpnt.showLabels
      if (!cpnt.showRegions) {
        show = show && cpnt.hiddenLabels.indexOf(rgData[4]) == -1
      }
      return show ? 'block' : 'none'
    })
    .transition()
    .style('opacity', function () {
      return rgData && rgData[4] ? 1 : 0
    })
  d3.select(txt).style('display', function () {
    let show = cpnt.showLabels
    if (!cpnt.showRegions) {
      show = show && cpnt.hiddenLabels.indexOf(rgData[4]) == -1
    }
    return show ? 'block' : 'none'
  })
  region.style('display', function () {
    return cpnt.hiddenLabels.indexOf(rgData[4]) == -1 ? 'block' : 'none'
  })

  d3.select(imgWrapper.querySelectorAll('.delete_region_wrapper[index="' + idx + '"]')[0])
    .attr('x', function () {
      closeX = parseFloat(rgData[0]) + parseFloat(rgData[2]) + closeMargin
      if (closeX + deleteSize >= cpnt.imgWidth) closeX = cpnt.imgWidth - deleteSize
      return closeX
    })
    .attr('y', function () {
      return parseFloat(rgData[1])
    })
    .attr('width', deleteSize)
    .attr('height', deleteSize)
    .style('display', function () {
      return cpnt.hiddenLabels.indexOf(rgData[4]) == -1 ? 'block' : 'none'
    })

  d3.select(imgWrapper.querySelectorAll('rect.top_left[index="' + idx + '"]')[0])
    .attr('x', function () {
      return rgData[0] - resizesz / 2
    })
    .attr('y', function () {
      return rgData[1] - resizesz / 2
    })
    .attr('width', resizesz)
    .attr('height', resizesz)
  d3.select(imgWrapper.querySelectorAll('rect.top_right[index="' + idx + '"]')[0])
    .attr('x', function () {
      return parseFloat(rgData[0]) + parseFloat(rgData[2] - resizesz / 2)
    })
    .attr('y', function () {
      return rgData[1] - resizesz / 2
    })
    .attr('width', resizesz)
    .attr('height', resizesz)
  d3.select(imgWrapper.querySelectorAll('rect.bottom_right[index="' + idx + '"]')[0])
    .attr('x', function () {
      return parseFloat(rgData[0]) + parseFloat(rgData[2]) - resizesz / 2
    })
    .attr('y', function () {
      return parseFloat(rgData[1]) + parseFloat(rgData[3]) - resizesz / 2
    })
    .attr('width', resizesz)
    .attr('height', resizesz)
  d3.select(imgWrapper.querySelectorAll('rect.bottom_left[index="' + idx + '"]')[0])
    .attr('x', function () {
      return rgData[0] - resizesz / 2
    })
    .attr('y', function () {
      return parseFloat(rgData[1]) + parseFloat(rgData[3]) - resizesz / 2
    })
    .attr('width', resizesz)
    .attr('height', resizesz)
  d3.selectAll(imgWrapper.querySelectorAll('rect.resize[index="' + idx + '"]')).style('display', function () {
    return cpnt.hiddenLabels.indexOf(rgData[4]) == -1 ? 'block' : 'none'
  })

  // Sort elements
  if (cpnt.editingMode) {
    d3.selectAll('rect.region,rect.resize').moveToFront()
    d3.selectAll('rect.region').each(function () {
      idx = d3.select(this).attr('index')
      d3.select(imgWrapper.querySelectorAll('rect.region_label_background[index="' + idx + '"]')[0]).moveToFront()
      d3.select(imgWrapper.querySelectorAll('text.region_label[index="' + idx + '"]')[0]).moveToFront()
    })
    d3.selectAll('.delete_region_wrapper').moveToFront()
  } else if (d3.select('rect.adding').empty()) {
    d3.select('rect.overlay').moveToFront()
    d3.selectAll('rect.region').each(function () {
      idx = d3.select(this).attr('index')
      d3.select(imgWrapper.querySelectorAll('rect.region_label_background[index="' + idx + '"]')[0]).moveToFront()
      d3.select(imgWrapper.querySelectorAll('text.region_label[index="' + idx + '"]')[0]).moveToFront()
    })
  } else {
    if (!d3.select('rect.adding').empty()) d3.select('rect.adding').moveToFront()
    d3.select('rect.overlay').moveToFront()
  }
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

      if (d3.select('rect.region.adding').empty()) initPoint = null

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
        cpnt.$emit('set-editing', false)
        if (cpnt.hiddenLabels.length) {
          let hlabels = _.cloneDeep(cpnt.hiddenLabels),
            idx = hlabels.indexOf(cpnt.selectedLabel)
          if (idx >= 0) {
            hlabels.splice(idx, 1)
            cpnt.$emit('update-hidden-labels', hlabels)
          }
        } else {
          cpnt.$emit('set-show-regions', true)
        }
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

function originScale(cpnt) {
  return {
    x: d3.scaleLinear().domain([0, cpnt.imgWidth]).range([0, cpnt.img.naturalWidth]).interpolate(d3.interpolateRound),
    y: d3.scaleLinear().domain([0, cpnt.imgHeight]).range([0, cpnt.img.naturalHeight]).interpolate(d3.interpolateRound)
  }
}

function containerScale(cpnt) {
  return {
    x: d3.scaleLinear().domain([0, cpnt.img.naturalWidth]).range([0, cpnt.imgWidth]),
    y: d3.scaleLinear().domain([0, cpnt.img.naturalHeight]).range([0, cpnt.imgHeight])
  }
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
    labels: {
      type: Array,
      default: function () {
        return []
      }
    },
    hiddenLabels: {
      type: Array,
      default: function () {
        return []
      }
    },
    selectedLabel: {
      type: String,
      default: ''
    },
    showLabels: {
      type: Boolean,
      default: false
    },
    showRegions: {
      type: Boolean,
      default: false
    },
    editingMode: {
      type: Boolean,
      default: false
    },
    raw: Boolean,
    expanded: Boolean
  },
  data: function () {
    return {
      img: null,
      imgWidth: 0,
      imgHeight: 0,
      isLoaded: false,
      isError: false,
      transform: { k: DEFAULT_ZOOM, x: 0, y: 0 }
    }
  },
  computed: {
    actualSize: function () {
      if (!this.isLoaded || !this.img) return null
      let fitWidth = parseFloat((WRAPPER_DIMENSION / this.img.naturalHeight) * this.img.naturalWidth),
        k = this.img.naturalWidth / fitWidth
      if (k < ZOOM_MIN) k = ZOOM_MIN
      if (k > ZOOM_MAX) k = ZOOM_MAX
      return k
    },
    labelSet: function () {
      return this.labels.slice()
    },
    birdUrl: function () {
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
    },
    hiddenLabels: function () {
      let cpnt = this
      if (!cpnt.showRegions) {
        d3.selectAll('rect.region').each(function () {
          updateRegionElements(d3.select(this), cpnt)
        })
      }
    },
    showLabels: function (val) {
      if (val) {
        this.displayLabels()
      } else {
        this.hideLabels()
      }
    },
    showRegions: function (val) {
      if (val) {
        this.displayAllRegions()
      } else {
        this.hideAllRegions()
      }
    },
    editingMode: function (val) {
      if (val) {
        this.enableEditingMode(true)
      } else {
        this.disableEditingMode()
      }
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
    error: function () {
      this.isError = true
    },
    init: function (el) {
      let cpnt = this
      cpnt.img = el
      cpnt.transform = { k: DEFAULT_ZOOM, x: 0, y: 0 }
      this.$emit('set-zoom', DEFAULT_ZOOM)
      if (!el || !cpnt.expanded) return false

      // Compute the image width and height
      this.imgWidth = (el.naturalWidth * el.height) / el.naturalHeight
      this.imgHeight = (el.naturalHeight * el.width) / el.naturalWidth
      if (this.imgHeight > MAX_IMG_HEIGHT) this.imgHeight = MAX_IMG_HEIGHT

      // Image svg
      d3.selectAll('svg').remove()
      let _g = d3
        .select(el.parentElement)
        .append('svg')
        .attr('id', 'svg_')
        .attr('class', 'overlay_wrapper')
        .attr('width', this.imgWidth)
        .attr('height', this.imgHeight)
        .style('top', el.offsetTop)
        .style('left', (el.width - this.imgWidth) / 2)
        .append('g')
        .attr('id', 'g_')

      cpnt.setRegions(cpnt.bird.regions || [], true)

      // Cross lines
      _g.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', this.imgHeight)
        .attr('stroke', '#FFFFFF')
        .attr('class', 'cross_line y')
        .style('display', 'none')
      _g.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', this.imgWidth)
        .attr('y2', 0)
        .attr('stroke', '#FFFFFF')
        .attr('class', 'cross_line x')
        .style('display', 'none')

      // Image overlay
      _g.append('rect')
        .attr('class', 'overlay')
        .attr('width', this.imgWidth)
        .attr('height', this.imgHeight)
        .style('fill', 'none')
        .on('mousedown.overlay', function (ev) {
          if (d3.select('rect.region.adding').empty()) {
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
            let addingRect = d3.select('rect.region.adding')
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
      if (cpnt.editingMode) this.enableEditingMode()
    },
    setRegions: function (data, animation) {
      let cpnt = this,
        _g = d3.select('#g_'),
        imgWrapper = cpnt.img.parentElement,
        validRegions = [],
        ic = 0,
        currentRg,
        colorFn

      while (ic < data.length) {
        currentRg = data[ic]
        if (currentRg.length == 5) {
          validRegions.push(currentRg)
          if (currentRg[4] && this.labelSet.indexOf(currentRg[4]) == -1) this.labelSet.push(currentRg[4])
        }
        ic++
      }
      this.$emit('update-labels', this.labelSet)
      colorFn = this.getColorFn(this.labelSet)

      // Image regions
      let regs = _g.selectAll('rect.region').classed('new', false).data(validRegions)
      regs
        .enter()
        .append('rect')
        .classed('new', true)
        .merge(regs)
        .attr('index', function (_, i) {
          return i
        })
        .attr('data-label', function (d) {
          return d[4] || cpnt.selectedLabel
        })
        .classed('region', true)
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
        .style('display', function (d) {
          return cpnt.hiddenLabels.indexOf(d[4]) == -1 ? 'block' : 'none'
        })
        .call(
          d3.drag().on('drag', function (event) {
            dragged(event, d3.select(this), cpnt)
          })
        )
        .transition()
        .duration(function () {
          if (animation && d3.select(this).classed('new') && !d3.select(this).classed('adding')) return 400
          return 0
        })
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
          updateRegionElements(d3.select(this), cpnt)
        })
      regs.exit().remove()

      // Image region labels
      let rglabels = _g.selectAll('text.region_label').classed('new', false).data(validRegions)
      rglabels
        .enter()
        .append('text')
        .classed('new', true)
        .merge(rglabels)
        .attr('index', function (_, i) {
          return i
        })
        .classed('region_label', true)
        .classed('adding', function (d) {
          return !d[4]
        })
        .style('font-size', '0.98em')
        .style('stroke', 'rgb(255, 255, 255)')
        .style('color', 'rgb(255, 255, 255)')
        .style('fill', 'rgb(255, 255, 255)')
        .style('stroke-width', 0)
        .style('opacity', function () {
          return d3.select(this).classed('new') ? 0 : 1
        })
      rglabels.exit().remove()
      let lbBackgrounds = _g.selectAll('rect.region_label_background').classed('new', false).data(validRegions)
      lbBackgrounds
        .enter()
        .append('rect')
        .classed('new', true)
        .merge(lbBackgrounds)
        .attr('index', function (_, i) {
          return i
        })
        .classed('region_label_background', true)
        .classed('adding', function (d) {
          return !d[4]
        })
        .attr('stroke', 'rgb(255, 255, 255)')
        .attr('stroke-width', 1)
        .attr('fill', 'rgb(0, 0, 0)')
        .style('opacity', function (d) {
          return d3.select(this).classed('new') || !d[4] ? 0 : 1
        })
      lbBackgrounds.exit().remove()

      // Init zoom when there are not regions
      if (!validRegions.length) {
        d3.select(imgWrapper.parentElement).call(zoom(cpnt, imgWrapper)).on('dblclick.zoom', null)
      }
    },
    getRegions: function () {
      var rgs = d3.selectAll('rect.region').data(),
        originalRegions = [],
        scl = originScale(this),
        idx = 0
      while (idx < rgs.length) {
        originalRegions.push([
          scl.x(rgs[idx][0]),
          scl.y(rgs[idx][1]),
          scl.x(rgs[idx][2]),
          scl.y(rgs[idx][3]),
          rgs[idx][4]
        ])
        idx++
      }
      return originalRegions
    },
    scaledRegions: function (rgs) {
      var scl = containerScale(this),
        scaledRgs = [],
        idx = 0
      while (idx < rgs.length) {
        scaledRgs.push([scl.x(rgs[idx][0]), scl.y(rgs[idx][1]), scl.x(rgs[idx][2]), scl.y(rgs[idx][3]), rgs[idx][4]])
        idx++
      }
      return scaledRgs
    },
    removeAllRegions: function () {
      d3.selectAll('.delete_region_wrapper,.resize').remove()
      this.setRegions([])
    },
    addNewRegion: function () {
      if (!d3.select('rect.region.adding').empty() || !initPoint || !this.selectedLabel) return false

      let x = initPoint[0],
        y = initPoint[1]

      if (this.labelSet.indexOf(this.selectedLabel) == -1) this.labelSet.push(this.selectedLabel)
      if (x > this.imgWidth || y > this.imgHeight) return false
      if (d3.selectAll('rect.region').size() >= REGIONS_ALLOWED) return false

      let data = d3.selectAll('rect.region').data()
      data.push([x, y, 0, 0, ''])
      this.setRegions(data)
    },
    finishRegion: function () {
      let addingRect = d3.select('rect.region.adding'),
        addingText = d3.select('text.region_label.adding'),
        addingBg = d3.select('rect.region_label_background.adding'),
        newRegion = [
          parseInt(addingRect.attr('x')),
          parseInt(addingRect.attr('y')),
          parseInt(addingRect.attr('width')),
          parseInt(addingRect.attr('height')),
          addingRect.attr('data-label') || this.selectedLabel
        ]

      initPoint = null
      addingRect.data([newRegion]).classed('adding', false)
      addingText.data([newRegion]).classed('adding', false)
      addingBg.data([newRegion]).classed('adding', false)
      updateRegionElements(addingRect, this)
    },
    onClickOutside: function () {
      if (this.raw && !d3.select('rect.region.adding').empty()) {
        this.finishRegion()
      }
    },
    removeRegionByIndex(idx) {
      let imgWrapper = this.img.parentElement
      d3.selectAll(imgWrapper.querySelectorAll('[index="' + idx + '"]')).remove()
    },
    removeRegionByLabel(lb) {
      let imgWrapper = this.img.parentElement,
        indexesToRemove = [],
        ir = 0
      d3.selectAll('rect.region').each(function (d) {
        if (d.length == 5 && d[4] == lb) indexesToRemove.push(d3.select(this).attr('index'))
      })
      while (ir < indexesToRemove.length) {
        d3.selectAll(imgWrapper.querySelectorAll('[index="' + indexesToRemove[ir] + '"]')).remove()
        ir++
      }
    },
    displayLabels: function () {
      let cpnt = this
      d3.selectAll('.region_label,.region_label_background').style('display', function (d) {
        return cpnt.showRegions || cpnt.hiddenLabels.indexOf(d[4]) == -1 ? 'block' : 'none'
      })
    },
    hideLabels: function () {
      d3.selectAll('.region_label,.region_label_background').style('display', 'none')
    },
    displayAllRegions: function () {
      d3.selectAll('rect.region').style('display', 'block')
      if (this.showLabels) {
        d3.selectAll('text.region_label,rect.region_label_background').style('display', 'block')
      }
      if (this.editingMode) {
        d3.selectAll('rect.resize,.delete_region_wrapper').style('display', 'block')
      }
    },
    hideAllRegions: function () {
      d3.selectAll(
        'text.region_label,rect.region,rect.resize,rect.region_label_background,.delete_region_wrapper'
      ).style('display', 'none')
    },
    enableEditingMode: function (update) {
      let cpnt = this,
        _g = d3.select('#g_'),
        idx

      _g.selectAll('rect.region').each(function () {
        idx = d3.select(this).attr('index')
        d3.select(this).moveToFront()
        // rects to resize the region
        _g.append('rect')
          .attr('stroke-width', 2)
          .attr('stroke', '#333333')
          .attr('fill', 'white')
          .attr('index', idx)
          .classed('resize top_left', true)
        _g.append('rect')
          .attr('stroke-width', 2)
          .attr('stroke', '#333333')
          .attr('fill', 'white')
          .attr('index', idx)
          .classed('resize top_right', true)
        _g.append('rect')
          .attr('stroke-width', 2)
          .attr('stroke', '#333333')
          .attr('fill', 'white')
          .attr('index', idx)
          .classed('resize bottom_right', true)
        _g.append('rect')
          .attr('stroke-width', 2)
          .attr('stroke', '#333333')
          .attr('fill', 'white')
          .attr('index', idx)
          .classed('resize bottom_left', true)
        // icon to remove the region
        _g.append('svg:foreignObject')
          .attr('index', idx)
          .attr('class', 'delete_region_wrapper')
          .on('mousedown', function () {
            cpnt.removeRegionByIndex(d3.select(this).attr('index'))
          })
          .append('xhtml:i')
          .attr('class', 'delete_region')
        if (update) updateRegionElements(d3.select(this), cpnt)
      })
      _g.selectAll('rect.resize').call(
        d3.drag().on('drag', function (event) {
          resized(event, this, cpnt)
        })
      )
    },
    disableEditingMode: function () {
      let _g = d3.select('#g_')
      _g.select('rect.overlay').moveToFront()
      _g.selectAll('.region_label_background,.region_label').moveToFront()
      _g.selectAll('rect.resize,.delete_region_wrapper').remove()
    },
    getColorFn: function (labels) {
      return d3.scaleOrdinal().range(CATEGORY_COLORS).domain(labels)
    },
    setActualSize: function () {
      if (!this.isLoaded) return false
      let cpnt = this,
        imgWrapper = this.img.parentElement
      d3.select(imgWrapper.parentElement).call(
        zoom(cpnt, imgWrapper).transform,
        d3.zoomIdentity.translate(cpnt.transform['x'], cpnt.transform['y']).scale(cpnt.actualSize)
      )
      this.$emit('set-zoom', cpnt.actualSize)
    },
    resetRegions: function () {
      d3.selectAll('.delete_region_wrapper,.resize').remove()
      this.setRegions(this.bird.regions || [], true)
      if (this.editingMode) this.enableEditingMode()
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
    }
  }
}
</script>
