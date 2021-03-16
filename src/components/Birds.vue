<template>
  <div class="birds_wrapper">
    <transition-group name="image-list" class="birds" appear>
      <bird :key="'grid_' + b.url" :bird="b" @open-modal="openModal(b, index)" v-for="(b, index) in birds" />
    </transition-group>
    <idialog
      ref="idialog"
      :dialog="dialog"
      :bird="selectedBird"
      :bird-index="birdIndex"
      :bird-length="birds.length"
      :labels="labels"
      @update-bird="updateBird"
      @close-modal="closeModal"
      @update-labels="updateLabels"
    />
    <v-btn @click="shuffle(true)">Shuffle</v-btn>
  </div>
</template>

<script>
import Bird from './Bird.vue'
import ImageDialog from './Dialog.vue'
import _ from 'lodash'

let shuffleInterval

export default {
  name: 'Birds',
  components: {
    bird: Bird,
    idialog: ImageDialog
  },
  data: function () {
    return {
      birds: [
        {
          url:
            'https://strato.dev.bigml.com/shared/source/6033c212520f907ec900000a/image/source/ic7TPfwzIwPT3tSX3n8lRvHYiRK',
          regions: []
        },
        {
          url:
            'https://strato.dev.bigml.com/shared/source/6033c212520f907ec900000d/image/source/ic7TPfwzIwPT3tSX3n8lRvHYiRK',
          regions: []
        },
        {
          url:
            'https://strato.dev.bigml.com/shared/source/6033c212520f907ec9000007/image/source/ic7TPfwzIwPT3tSX3n8lRvHYiRK',
          regions: []
        },
        {
          url:
            'https://strato.dev.bigml.com/shared/source/6033ef65520f907ef3000004/image/source/ic7TPfwzIwPT3tSX3n8lRvHYiRK',
          regions: []
        },
        {
          url:
            'https://strato.dev.bigml.com/shared/source/6033c213520f907ec9000010/image/source/ic7TPfwzIwPT3tSX3n8lRvHYiRK',
          regions: []
        },
        {
          url:
            'https://strato.dev.bigml.com/shared/source/603cd1ab520f907e81000098/image/source/ic7TPfwzIwPT3tSX3n8lRvHYiRK',
          regions: []
        },
        {
          url:
            'https://strato.dev.bigml.com/shared/source/603cd112520f907e5e00009b/image/source/ic7TPfwzIwPT3tSX3n8lRvHYiRK',
          regions: []
        },
        {
          url:
            'https://strato.dev.bigml.com/shared/source/603d01f0520f907e510000c3/image/source/ic7TPfwzIwPT3tSX3n8lRvHYiRK',
          regions: []
        },
        {
          url:
            'https://strato.dev.bigml.com/shared/source/603d01f0520f907e8100009b/image/source/ic7TPfwzIwPT3tSX3n8lRvHYiRK',
          regions: []
        }
      ],
      labels: ['goshawk', 'golden', 'snake eagle', 'imperial', 'vulture', 'bonelli'],
      selectedBird: null,
      birdIndex: 0,
      dialog: false
    }
  },
  created: function () {
    this.resetInterval()
  },
  methods: {
    shuffle: function (reset) {
      this.birds = _.shuffle(this.birds)
      if (reset) this.resetInterval()
    },
    resetInterval: function () {
      let cm = this
      clearInterval(shuffleInterval)
      shuffleInterval = setInterval(function () {
        cm.shuffle()
      }, 5000)
    },
    updateLabels: function (val) {
      if (val) this.labels = val
    },
    updateBird: function (idx) {
      this.selectedBird = this.birds[idx - 1]
      this.birdIndex = idx - 1
      if (this.$refs.idialog.$refs.birdComponent) {
        this.$refs.idialog.$refs.birdComponent.resetZoom()
      }
    },
    openModal: function (bird, idx) {
      if (bird) {
        this.selectedBird = bird
        this.birdIndex = idx
      }
      clearInterval(shuffleInterval)
      this.dialog = true
      if (this.$refs.idialog.$refs.birdComponent) {
        this.$refs.idialog.resetImage()
        this.$refs.idialog.$refs.birdComponent.resetRegions()
      }
    },
    closeModal: function () {
      this.dialog = false
      this.resetInterval()
    }
  }
}
</script>
