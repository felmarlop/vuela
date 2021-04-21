<template>
  <v-dialog
    :value="dialog"
    fullscreen
    persistent
    hide-overlay
    transition="dialog-bottom-transition"
    content-class="image_dialog"
  >
    <v-card>
      <v-toolbar dark color="secondary">
        <v-btn icon dark @click="closeModal()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Image regions</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn dark text @click="closeModal()">Close</v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-subheader :style="{ height: '70px' }">
        To draw your first region type a label, click the start point on the image, move and click the end point to
        finish.
      </v-subheader>
      <v-alert v-model="alert" dismissible dense :type="alertMessageType" class="message mt-4">
        <span v-html="alertMessage"></span>
      </v-alert>
      <v-divider></v-divider>
      <v-row dense>
        <v-col :md="imgLoaded && regionEvents ? 8 : 12">
          <bird
            ref="birdComponent"
            :key="bird.url"
            :bird="bird"
            :raw="true"
            :region-events="regionEvents"
            :expanded="true"
            :img-style="imgStyle"
            :zoom="zoom"
            :labels="labels"
            :hidden-labels="hiddenLabels"
            :selected-label="selectedLabel"
            :show-labels="showLabels"
            :show-regions="showRegions"
            :editing-mode="editingMode"
            @update-labels="$emit('update-labels', $event)"
            @update-bird="$emit('update-bird', $event)"
            @update-hidden-labels="updateHiddenLabels"
            @image-loaded="imgLoaded = true"
            @set-alert-message="setAlertMessage"
            @hide-alert-message="alert = false"
            @set-zoom="setZoom"
            @set-show-labels="setShowLabels"
            @set-show-regions="setShowRegions"
            @set-editing="setEditing"
            v-if="bird"
          />
          <v-pagination v-model="imgPage" :length="birdLength" :total-visible="5" color="secondary" v-if="imgLoaded">
          </v-pagination>
          <div class="buttons_img" v-if="imgLoaded">
            <div class="group_ico">
              <span class="zoom_value value">Ratio: {{ zoom }}</span>
              <v-tooltip top>
                <template #activator="{ on, attrs }">
                  <v-btn
                    color="white"
                    class="ico"
                    small
                    :class="{ active: actualSizeActive }"
                    icon
                    v-bind="attrs"
                    v-on="on"
                    @click="$refs.birdComponent.setActualSize()"
                  >
                    <v-icon>mdi-actual-size</v-icon>
                  </v-btn>
                </template>
                <span>Actual size (SHIFT+G)</span>
              </v-tooltip>
              <v-tooltip top>
                <template #activator="{ on, attrs }">
                  <v-btn
                    color="white"
                    class="ico"
                    small
                    :class="{ active: resetZoomActive }"
                    icon
                    v-bind="attrs"
                    v-on="on"
                    @click="$refs.birdComponent.resetZoom()"
                  >
                    <v-icon>mdi-reset-zoom</v-icon>
                  </v-btn>
                </template>
                <span>Fit window (SHIFT+F)</span>
              </v-tooltip>
              <v-tooltip top>
                <template #activator="{ on, attrs }">
                  <v-btn color="white" class="ico" small icon v-bind="attrs" v-on="on" @click="decreaseZoom()">
                    <v-icon>mdi-magnify-minus</v-icon>
                  </v-btn>
                </template>
                <span>Zoom out (SHIFT+O)</span>
              </v-tooltip>
              <v-tooltip top>
                <template #activator="{ on, attrs }">
                  <v-btn color="white" class="ico" small icon v-bind="attrs" v-on="on" @click="increaseZoom()">
                    <v-icon>mdi-magnify-plus</v-icon>
                  </v-btn>
                </template>
                <span>Zoom in (SHIFT+I)</span>
              </v-tooltip>
            </div>
            <div class="group_ico">
              <span class="brightness_value value">{{ brightness }}%</span>
              <v-tooltip top>
                <template #activator="{ on, attrs }">
                  <v-btn color="white" class="ico" small icon v-bind="attrs" v-on="on" @click="decreaseBrightness()">
                    <v-icon>mdi-brightness-minus</v-icon>
                  </v-btn>
                </template>
                <span>Decrease brightness (SHIFT+A)</span>
              </v-tooltip>
              <v-tooltip top>
                <template #activator="{ on, attrs }">
                  <v-btn color="white" class="ico" small icon v-bind="attrs" v-on="on" @click="increaseBrightness()">
                    <v-icon>mdi-brightness-plus</v-icon>
                  </v-btn>
                </template>
                <span>Increase brightness (SHIFT+S)</span>
              </v-tooltip>
            </div>
            <div class="group_ico">
              <span class="contrast_value value">{{ contrast }}%</span>
              <v-tooltip top>
                <template #activator="{ on, attrs }">
                  <v-btn color="white" class="ico" small icon v-bind="attrs" v-on="on" @click="decreaseContrast()">
                    <v-icon>mdi-contrast-minus</v-icon>
                  </v-btn>
                </template>
                <span>Increase contrast (SHIFT+X)</span>
              </v-tooltip>
              <v-tooltip top>
                <template #activator="{ on, attrs }">
                  <v-btn color="white" class="ico" small icon v-bind="attrs" v-on="on" @click="increaseContrast()">
                    <v-icon>mdi-contrast-plus</v-icon>
                  </v-btn>
                </template>
                <span>Increase contrast (SHIFT+C)</span>
              </v-tooltip>
            </div>
            <v-tooltip top>
              <template #activator="{ on, attrs }">
                <v-btn color="white" class="ico" small icon v-bind="attrs" v-on="on" @click="resetImage()">
                  <v-icon>mdi-reload</v-icon>
                </v-btn>
              </template>
              <span>Reset image (SHIFT+R)</span>
            </v-tooltip>
          </div>
        </v-col>
        <v-col md="4" class="pa-md-4" v-if="imgLoaded && regionEvents">
          <v-text-field
            v-model="selectedLabel"
            placeholder="Type your label"
            outlined
            class="float-left ml-4 mt-4"
            :style="{ width: '70%' }"
            @change="addNewLabel($event)"
            @focus="inputFocused = true"
            @blur="inputFocused = false"
          ></v-text-field>
          <v-btn class="mt-6" icon outlined @click="selectedLabel = ''"><v-icon>mdi-close</v-icon></v-btn>
          <v-switch
            v-model="showLabels"
            class="d-block ml-4"
            color="secondary"
            :label="showLabels ? 'Hide region labels' : 'Show region labels'"
          >
          </v-switch>
          <v-switch
            v-model="showRegions"
            class="d-block ml-4"
            color="secondary"
            :label="showRegions ? 'Hide all regions' : 'Show all regions'"
            @change="setShowRegions($event)"
          >
          </v-switch>
          <v-switch
            v-model="editingMode"
            class="d-block ml-4"
            color="secondary"
            :label="editingMode ? 'Disable editing mode' : 'Enable editing mode'"
          >
          </v-switch>
          <v-tooltip left>
            <template #activator="{ on, attrs }">
              <v-btn
                class="ma-auto mb-4 d-block"
                icon
                outlined
                v-bind="attrs"
                v-on="on"
                @click="$refs.birdComponent.removeAllRegions()"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
            <span>Remove all regions (CTRL+SHIFT+D)</span>
          </v-tooltip>
          <v-divider></v-divider>
          <v-list rounded class="labels overflow-y-auto" :style="{ maxHeight: '28%' }">
            <v-list-item-group v-model="selectedItem" color="secondary">
              <v-list-item
                :key="'label_' + item"
                :style="labelColor(item)"
                class="d-inline-block mr-1"
                v-for="(item, idx) in labels"
              >
                <v-list-item-content class="d-inline-block">
                  <v-list-item-title class="d-inline-block label_wrapper" v-html="labelContent(item, idx)">
                  </v-list-item-title>
                </v-list-item-content>
                <v-hover v-slot="{ hover }">
                  <v-list-item-action class="float-right mt-3" @click.stop="clickListIcon(item)">
                    <v-icon small :color="hover ? (showRegions ? 'red' : 'green') : ''">
                      {{ showRegions ? 'mdi-close' : hiddenLabels.indexOf(item) >= 0 ? 'mdi-eye-off' : 'mdi-eye' }}
                    </v-icon>
                  </v-list-item-action>
                </v-hover>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-col>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script>
import Bird from './Bird.vue'
import _ from 'lodash'

const DEFAULT_LUMINOSITY = 100
const DEFAULT_ZOOM = 1
const LUMINOSITY_STEP = 10
const LUMINOSITY_MAX = 300
const LUMINOSITY_MIN = 0
const ZOOM_STEP = 0.1
const ZOOM_MAX = 8
const ZOOM_MIN = 0.01

export default {
  components: { bird: Bird },
  props: {
    dialog: Boolean,
    regionEvents: Boolean,
    bird: {
      type: Object,
      default: null
    },
    birdIndex: {
      type: Number,
      default: 0
    },
    birdLength: {
      type: Number,
      default: 0
    },
    labels: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  data: function () {
    return {
      brightness: DEFAULT_LUMINOSITY,
      contrast: DEFAULT_LUMINOSITY,
      zoom: DEFAULT_ZOOM,
      alert: false,
      alertMessage: '',
      alertMessageType: 'success',
      selectedLabel: '',
      hiddenLabels: [],
      inputFocused: false,
      showLabels: true,
      showRegions: true,
      editingMode: false,
      imgLoaded: false
    }
  },
  computed: {
    imgStyle: function () {
      return {
        filter: 'brightness(' + this.brightness + '%) contrast(' + this.contrast + '%)'
      }
    },
    labelStyle: function () {
      return { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
    },
    actualSizeActive: function () {
      return this.zoom == Math.round(this.$refs.birdComponent.actualSize * 100) / 100
    },
    resetZoomActive: function () {
      let tr = this.$refs.birdComponent.transform
      return this.zoom == DEFAULT_ZOOM && !tr.x && !tr.y
    },
    imgPage: {
      get: function () {
        return this.birdIndex + 1
      },
      set: function (page) {
        this.$emit('set-bird', page - 1)
      }
    },
    selectedItem: {
      get: function () {
        return this.labels.indexOf(this.selectedLabel) >= 0 ? this.labels.indexOf(this.selectedLabel) : null
      },
      set: function (idx) {
        if (idx >= 0 && idx < this.labels.length) this.selectedLabel = this.labels[idx]
        if (this.$refs.birdComponent) this.$refs.birdComponent.updateClickedLabel(this.selectedLabel)
      }
    }
  },
  created: function () {
    let cpnt = this,
      args = { lbIndex: '', lbTimeout: undefined }
    window.addEventListener('keydown', function (event) {
      cpnt.shortcuts(event, args)
    })
  },
  destroyed: function () {
    window.removeEventListener('keydown', this.shortcuts)
  },
  methods: {
    setAlertMessage: function (msg, msgType) {
      if (!msg) return false
      this.alert = true
      this.alertMessage = msg
      this.alertMessageType = msgType || 'success'
    },
    closeModal: function () {
      this.alert = false
      this.alertMessage = ''
      this.$emit('close-modal')
    },
    addNewLabel: function (newLabel) {
      let labelSet = this.labels.slice()
      if (newLabel && labelSet.indexOf(newLabel) == -1) {
        labelSet.push(newLabel)
        this.$emit('update-labels', labelSet)
      }
      if (this.$refs.birdComponent) this.$refs.birdComponent.updateClickedLabel(newLabel)
    },
    labelContent: function (item, idx) {
      return '<span class="label_index">[' + idx + ']</span><span>' + item + '</span>'
    },
    clickListIcon: function (lb) {
      if (this.showRegions) {
        this.$refs.birdComponent.removeRegionByLabel(lb)
      } else if (this.hiddenLabels.indexOf(lb) >= 0) {
        this.hiddenLabels.splice(this.hiddenLabels.indexOf(lb), 1)
        this.selectedLabel = lb
      } else {
        this.hiddenLabels.push(lb)
      }
    },
    updateHiddenLabels: function (lbs) {
      if (lbs) this.hiddenLabels = lbs
    },
    labelColor: function (item) {
      if (this.$refs.birdComponent) {
        let colorFn = this.$refs.birdComponent.getColorFn(this.labels)
        return { backgroundColor: colorFn(item) }
      }
    },
    increaseZoom: function () {
      this.zoom += ZOOM_STEP
      if (this.zoom > ZOOM_MAX) this.zoom = ZOOM_MAX
      this.zoom = Math.round(this.zoom * 100) / 100
    },
    increaseBrightness: function () {
      this.brightness += LUMINOSITY_STEP
      if (this.brightness > LUMINOSITY_MAX) this.brightness = LUMINOSITY_MAX
    },
    increaseContrast: function () {
      this.contrast += LUMINOSITY_STEP
      if (this.contrast > LUMINOSITY_MAX) this.contrast = LUMINOSITY_MAX
    },
    decreaseZoom: function () {
      this.zoom -= ZOOM_STEP
      if (this.zoom < ZOOM_MIN) this.zoom = ZOOM_MIN
      this.zoom = Math.round(this.zoom * 100) / 100
    },
    decreaseBrightness: function () {
      this.brightness -= LUMINOSITY_STEP
      if (this.brightness < LUMINOSITY_MIN) this.brightness = LUMINOSITY_MIN
    },
    decreaseContrast: function () {
      this.contrast -= LUMINOSITY_STEP
      if (this.contrast < LUMINOSITY_MIN) this.contrast = LUMINOSITY_MIN
    },
    setShowLabels: function (val) {
      this.showLabels = val
    },
    setShowRegions: function (val) {
      this.hiddenLabels = val ? [] : _.cloneDeep(this.labels)
      this.showRegions = val
    },
    setEditing: function (val) {
      this.editingMode = val
    },
    setZoom: function (val) {
      if (typeof val !== 'number' || val < ZOOM_MIN) val = ZOOM_MIN
      if (val > ZOOM_MAX) val = ZOOM_MAX
      this.zoom = Math.round(val * 100) / 100
    },
    shortcuts: function (event, args) {
      if (!this.dialog || !this.imgLoaded || this.inputFocused) return false
      let cpnt = this,
        kcode = event.keyCode
      if (event.shiftKey && event.ctrlKey) {
        switch (kcode) {
          // Remove all regions (ctrl+shift+d)
          case 68:
            if (this.$refs.birdComponent) {
              this.$refs.birdComponent.removeAllRegions()
            }
            break
        }
      } else if (event.ctrlKey) {
        switch (kcode) {
          // Copy regions (ctrl+c)
          case 67:
            break
          // Paste regions (ctrl+v)
          case 86:
            break
        }
      } else if (event.shiftKey) {
        switch (kcode) {
          // Decrease brightness (shift+a)
          case 65:
            this.decreaseBrightness()
            break
          // Increase contrast (shift+c)
          case 67:
            this.increaseContrast()
            break
          // Enable/disable region editor (shift+e)
          case 69:
            this.editingMode = !this.editingMode
            break
          // Fit window (shift+f)
          case 70:
            if (this.$refs.birdComponent) {
              this.$refs.birdComponent.resetZoom()
            }
            break
          // Actual size (shift+g)
          case 71:
            if (this.$refs.birdComponent) {
              this.$refs.birdComponent.setActualSize()
            }
            break
          // Hide/show regions (shift+h)
          case 72:
            this.showRegions = !this.showRegions
            break
          // Zoom in (shift+i)
          case 73:
            this.increaseZoom()
            break
          // Hide/show region labels (shift+l)
          case 76:
            this.showLabels = !this.showLabels
            break
          // Zoom out (shift+o)
          case 79:
            this.decreaseZoom()
            break
          // Reset image properties (shift+r)
          case 82:
            this.resetImage()
            break
          // Increase brightness (shift+s)
          case 83:
            this.increaseBrightness()
            break
          // Switch selected label (shift+t)
          case 84:
            if (this.selectedItem < this.labels.length - 1) {
              this.selectedItem += 1
            } else {
              this.selectedItem = 0
            }
            break
          // Decrease contrast (shift+x)
          case 88:
            this.decreaseContrast()
            break
        }
      } else {
        switch (kcode) {
          // Remove last region (DELETE)
          case 8:
            if (this.$refs.birdComponent) {
              let idx = this.labels.length - 1
              this.$refs.birdComponent.removeLastRegion(idx)
            }
            break
          // Remove adding region (ESC)
          case 27:
            if (this.$refs.birdComponent) {
              this.$refs.birdComponent.removeAddingRegion()
              this.$refs.birdComponent.unclickLabels()
            }
            break
          // Next image (->, SPACE)
          case 32:
          case 39:
            if (this.imgPage == this.birdLength) return false
            this.imgPage += 1
            break
          // Previous image (<-)
          case 37:
            if (this.imgPage == 1) return false
            this.imgPage -= 1
            break
        }
        if (kcode >= 48 && kcode <= 57) {
          args.lbIndex += String.fromCharCode(kcode)
          clearTimeout(args.lbTimeout)
          args.lbTimeout = setTimeout(function () {
            let idx = parseInt(args.lbIndex)
            if (idx < cpnt.labels.length) cpnt.selectedItem = idx
            args.lbIndex = ''
          }, 300)
        }
      }
    },
    resetImage: function () {
      this.brightness = DEFAULT_LUMINOSITY
      this.contrast = DEFAULT_LUMINOSITY
      if (this.$refs.birdComponent) {
        this.$refs.birdComponent.resetZoom()
      }
    }
  }
}
</script>
