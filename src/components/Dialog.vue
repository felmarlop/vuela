<template>
  <v-dialog :value="dialog" fullscreen hide-overlay transition="dialog-bottom-transition" content-class="image_dialog">
    <v-card>
      <v-toolbar dark color="secondary">
        <v-btn icon dark @click="$emit('close-modal')">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Image regions</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn dark text @click="$emit('close-modal')">Close</v-btn>
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
        <v-col md="8">
          <bird
            ref="birdComponent"
            :key="bird.url"
            :bird="bird"
            :raw="true"
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
            @set-zoom="setZoom"
            @set-show-regions="setShowRegions"
            @set-editing="setEditing"
            v-if="bird"
          />
          <v-pagination v-model="imgPage" :length="birdLength" :total-visible="5" color="secondary" v-if="imgLoaded">
          </v-pagination>
          <v-divider></v-divider>
          <div class="buttons_img" v-if="imgLoaded">
            <div class="group_ico">
              <span class="zoom_value value">Ratio: {{ zoom }}</span>
              <v-btn
                color="white"
                class="ico"
                small
                :class="{ active: actualSizeActive }"
                icon
                @click="$refs.birdComponent.setActualSize()"
              >
                <v-icon>mdi-actual-size</v-icon>
              </v-btn>
              <v-btn
                color="white"
                class="ico"
                small
                :class="{ active: resetZoomActive }"
                icon
                @click="$refs.birdComponent.resetZoom()"
              >
                <v-icon>mdi-reset-zoom</v-icon>
              </v-btn>
              <v-btn color="white" class="ico" small icon @click="decreaseZoom()">
                <v-icon>mdi-magnify-minus</v-icon>
              </v-btn>
              <v-btn color="white" class="ico" small icon @click="increaseZoom()">
                <v-icon>mdi-magnify-plus</v-icon>
              </v-btn>
            </div>
            <div class="group_ico">
              <span class="brightness_value value">{{ brightness }}%</span>
              <v-btn color="white" class="ico" small icon @click="decreaseBrightness()">
                <v-icon>mdi-brightness-minus</v-icon>
              </v-btn>
              <v-btn color="white" class="ico" small icon @click="increaseBrightness()">
                <v-icon>mdi-brightness-plus</v-icon>
              </v-btn>
            </div>
            <div class="group_ico">
              <span class="contrast_value value">{{ contrast }}%</span>
              <v-btn color="white" class="ico" small icon @click="decreaseContrast()">
                <v-icon>mdi-contrast-minus</v-icon>
              </v-btn>
              <v-btn color="white" class="ico" small icon @click="increaseContrast()">
                <v-icon>mdi-contrast-plus</v-icon>
              </v-btn>
            </div>
            <v-btn color="white" class="ico" small icon @click="resetImage()">
              <v-icon>mdi-reload</v-icon>
            </v-btn>
          </div>
        </v-col>
        <v-col md="4" class="pa-md-4" v-if="imgLoaded">
          <v-text-field
            v-model="selectedLabel"
            placeholder="Type your label"
            outlined
            class="float-left ml-4"
            :style="{ width: '80%' }"
            @change="addNewLabel($event)"
          ></v-text-field>
          <v-btn class="mt-2" icon outlined @click="selectedLabel = ''"><v-icon>mdi-close</v-icon></v-btn>
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
          <v-btn class="ma-auto mb-4 d-block" icon outlined @click="$refs.birdComponent.removeAllRegions()">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
          <v-divider></v-divider>
          <v-list rounded class="labels overflow-y-auto">
            <v-list-item-group v-model="selectedItem" color="secondary">
              <v-list-item
                :key="'label_' + item"
                :style="labelColor(item)"
                class="d-inline-block mr-1"
                v-for="item in labels"
              >
                <v-list-item-content class="d-inline-block label_wrapper">
                  <v-list-item-title :style="labelStyle" v-text="item"></v-list-item-title>
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
      selectedLabel: 'test_label',
      hiddenLabels: [],
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
      return this.zoom == DEFAULT_ZOOM
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
      }
    }
  },
  created: function () {
    this.selectedLabel = this.labels.length ? this.labels[this.labels.length - 1] : ''
  },
  methods: {
    setAlertMessage: function (msg, msgType) {
      if (!msg) return false
      this.alert = true
      this.alertMessage = msg
      this.alertMessageType = msgType || 'success'
    },
    addNewLabel: function (newLabel) {
      var labelSet = this.labels.slice()
      if (newLabel && labelSet.indexOf(newLabel) == -1) {
        labelSet.push(newLabel)
        this.$emit('update-labels', labelSet)
      }
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
    resetImage: function () {
      this.brightness = DEFAULT_LUMINOSITY
      this.contrast = DEFAULT_LUMINOSITY
      this.$refs.birdComponent.resetZoom()
    }
  }
}
</script>
