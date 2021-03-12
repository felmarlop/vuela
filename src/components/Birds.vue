<template>
  <div class="birds_wrapper">
    <transition-group name="image-list" class="birds" appear>
      <bird :key="'grid_' + b.url" :bird="b" @open-modal="openModal" v-for="b in birds" />
    </transition-group>
    <idialog
      ref="idialog"
      :dialog="dialog"
      :bird="selectedBird"
      :labels="labels"
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
          regions: [[257, 28, 272, 216, 'goshawk']]
        },
        {
          url:
            'https://strato.dev.bigml.com/shared/source/6033c212520f907ec900000d/image/source/ic7TPfwzIwPT3tSX3n8lRvHYiRK',
          regions: [
            [15, 187, 306, 220, 'golden'],
            [356, 107, 329, 225, 'golden']
          ]
        },
        {
          url:
            'https://strato.dev.bigml.com/shared/source/6033c212520f907ec9000007/image/source/ic7TPfwzIwPT3tSX3n8lRvHYiRK',
          regions: [[208, 133, 150, 251, 'snake eagle']]
        },
        {
          url:
            'https://strato.dev.bigml.com/shared/source/6033ef65520f907ef3000004/image/source/ic7TPfwzIwPT3tSX3n8lRvHYiRK',
          regions: [[195, 25, 434, 469, 'imperial']]
        },
        {
          url:
            'https://strato.dev.bigml.com/shared/source/6033c213520f907ec9000010/image/source/ic7TPfwzIwPT3tSX3n8lRvHYiRK',
          regions: [[298, 78, 98, 264, 'golden']]
        },
        {
          url:
            'https://strato.dev.bigml.com/shared/source/603cd1ab520f907e81000098/image/source/ic7TPfwzIwPT3tSX3n8lRvHYiRK',
          regions: [
            [44, 112, 254, 223, 'golden'],
            [387, 107, 237, 211, 'golden']
          ]
        },
        {
          url:
            'https://strato.dev.bigml.com/shared/source/603cd112520f907e5e00009b/image/source/ic7TPfwzIwPT3tSX3n8lRvHYiRK',
          regions: [
            [160, 70, 152, 291, 'vulture'],
            [413, 110, 123, 270, 'vulture']
          ]
        },
        {
          url:
            'https://strato.dev.bigml.com/shared/source/603d01f0520f907e510000c3/image/source/ic7TPfwzIwPT3tSX3n8lRvHYiRK',
          regions: [
            [124, 64, 145, 220, 'bonelli'],
            [499, 433, 108, 165, 'bonelli']
          ]
        },
        {
          url:
            'https://strato.dev.bigml.com/shared/source/603d01f0520f907e8100009b/image/source/ic7TPfwzIwPT3tSX3n8lRvHYiRK',
          regions: [
            [239, 103, 195, 319, 'imperial'],
            [366, 74, 249, 280, 'imperial']
          ]
        }
      ],
      labels: ['goshawk', 'golden', 'snake eagle', 'imperial', 'vulture', 'bonelli'],
      selectedBird: null,
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
    openModal: function (bird) {
      if (bird) this.selectedBird = bird
      this.dialog = true
    },
    closeModal: function () {
      this.dialog = false
      this.$refs.idialog.resetImage()
      this.$refs.idialog.$refs.birdComponent.resetRegions()
    }
  }
}
</script>
