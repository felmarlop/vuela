<template>
  <v-dialog :value="dialog" fullscreen hide-overlay transition="dialog-bottom-transition" content-class="image_dialog">
    <v-card>
      <v-toolbar dark color="primary">
        <v-btn icon dark @click="$emit('close-modal')">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Nice image</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn dark text @click="$emit('close-modal')">Close</v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-subheader>Aguilucho.jpg</v-subheader>
      <v-divider></v-divider>
      <bird
        :key="bird.url"
        :bird="bird"
        :raw="true"
        :expanded="true"
        :styles="imgStyle"
        @image-loaded="imgLoaded = true"
        v-if="bird"
      />
      <v-divider></v-divider>
      <div class="buttons_img" v-if="imgLoaded">
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
    </v-card>
  </v-dialog>
</template>

<script>
import Bird from './Bird.vue'

const DEFAULT_LUMINOSITY = 100
const LUMINOSITY_STEP = 10
const LUMINOSITY_MAX = 300
const LUMINOSITY_MIN = 0

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
    increaseBrightness: function () {
      this.brightness += LUMINOSITY_STEP
      if (this.brightness > LUMINOSITY_MAX) this.brightness = LUMINOSITY_MAX
    },
    increaseContrast: function () {
      this.contrast += LUMINOSITY_STEP
      if (this.contrast > LUMINOSITY_MAX) this.contrast = LUMINOSITY_MAX
    },
    decreaseBrightness: function () {
      this.brightness -= LUMINOSITY_STEP
      if (this.brightness < LUMINOSITY_MIN) this.brightness = LUMINOSITY_MIN
    },
    decreaseContrast: function () {
      this.contrast -= LUMINOSITY_STEP
      if (this.contrast < LUMINOSITY_MIN) this.contrast = LUMINOSITY_MIN
    },
    resetImage: function () {
      this.brightness = DEFAULT_LUMINOSITY
      this.contrast = DEFAULT_LUMINOSITY
    }
  }
}
</script>
