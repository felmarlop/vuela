<template>
  <v-dialog :value="dialog" fullscreen hide-overlay transition="dialog-bottom-transition" content-class="image_dialog">
    <v-card>
      <v-toolbar dark color="primary">
        <v-btn icon dark @click="$emit('close-modal')">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Image regions</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn dark text @click="$emit('close-modal')">Close</v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-subheader>
        To draw your first region type a label, click the start point on the image, move and click the end point to
        finish.
      </v-subheader>
      <v-divider></v-divider>
      <v-row dense>
        <v-col :cols="10">
          <bird
            ref="birdComponent"
            :key="bird.url"
            :bird="bird"
            :raw="true"
            :expanded="true"
            :styles="imgStyle"
            :zoom="zoom"
            :selected-label="selectedLabel"
            @image-loaded="imgLoaded = true"
            @image-loading="imgLoaded = false"
            @set-zoom="setZoom"
            v-if="bird"
          />
          <v-divider></v-divider>
          <div class="buttons_img" v-if="imgLoaded">
            <div class="group_ico">
              <span class="zoom_value value">Ratio: {{ zoom }}</span>
              <div id="zoom_image" class="zoom_image fit_image ico" @click="$refs.birdComponent.resetZoom()">
                <span></span>
              </div>
              <div id="zoom_image" class="zoom_image zoom_out_image ico" @click="decreaseZoom()">
                <span></span>
              </div>
              <span class="divider"></span>
              <div id="zoom_image" class="zoom_image zoom_in_image ico" @click="increaseZoom()">
                <span></span>
              </div>
            </div>
            <div class="group_ico">
              <span class="brightness_value value">{{ brightness }}%</span>
              <div id="brightness_image" class="decrease_br intensity ico" @click="decreaseBrightness()">
                <span></span>
              </div>
              <span class="divider"></span>
              <div id="brightness_image" class="increase_br intensity ico" @click="increaseBrightness()">
                <span></span>
              </div>
            </div>
            <div class="group_ico">
              <span class="contrast_value value">{{ contrast }}%</span>
              <div id="contrast_image" class="decrease_ct intensity ico" @click="decreaseContrast()">
                <span></span>
              </div>
              <span class="divider"></span>
              <div id="contrast_image" class="increase_ct intensity ico" @click="increaseContrast()">
                <span></span>
              </div>
            </div>
            <div id="reset_original" class="reset_original ico disabled" @click="resetImage()">
              <span></span>
            </div>
          </div>
        </v-col>
        <v-col :cols="2" class="controls">
          <v-text-field v-model="selectedLabel" placeholder="Type your label" outlined class="pr-10"></v-text-field>
        </v-col>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script>
import Bird from './Bird.vue'

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
    }
  },
  data: function () {
    return {
      brightness: DEFAULT_LUMINOSITY,
      contrast: DEFAULT_LUMINOSITY,
      zoom: DEFAULT_ZOOM,
      selectedLabel: '',
      imgLoaded: false
    }
  },
  computed: {
    imgStyle: function () {
      return {
        filter: 'brightness(' + this.brightness + '%) contrast(' + this.contrast + '%)'
      }
    }
  },
  methods: {
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
