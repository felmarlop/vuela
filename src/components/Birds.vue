<template>
  <div class="birds_wrapper">
    <transition-group name="image-list" class="birds" appear>
      <bird :key="b.url" :bird="b" @open-modal="openModal" v-for="b in birds" />
    </transition-group>
    <idialog ref="idialog" :dialog="dialog" :bird="selectedBird" :labels="labels" @close-modal="closeModal" />
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
          regions: [[330, 32, 350, 290, 'goshawk']]
        },
        {
          url:
            'https://strato.dev.bigml.com/shared/source/6033c212520f907ec900000d/image/source/ic7TPfwzIwPT3tSX3n8lRvHYiRK',
          regions: [
            [14, 240, 405, 290, 'golden'],
            [434, 130, 450, 300, 'golden']
          ]
        },
        {
          url:
            'https://strato.dev.bigml.com/shared/source/6033c212520f907ec9000007/image/source/ic7TPfwzIwPT3tSX3n8lRvHYiRK',
          regions: [[258, 161, 210, 335, 'snake eagle']]
        },
        {
          url:
            'https://strato.dev.bigml.com/shared/source/6033ef65520f907ef3000004/image/source/ic7TPfwzIwPT3tSX3n8lRvHYiRK',
          regions: [[233, 22, 585, 615, 'imperial']]
        },
        {
          url:
            'https://strato.dev.bigml.com/shared/source/6033c213520f907ec9000010/image/source/ic7TPfwzIwPT3tSX3n8lRvHYiRK',
          regions: [[366, 91, 150, 350, 'golden']]
        },
        {
          url:
            'https://strato.dev.bigml.com/shared/source/603cd1ab520f907e81000098/image/source/ic7TPfwzIwPT3tSX3n8lRvHYiRK',
          regions: [
            [52, 131, 340, 300, 'golden'],
            [490, 134, 315, 280, 'golden']
          ]
        },
        {
          url:
            'https://strato.dev.bigml.com/shared/source/603cd112520f907e5e00009b/image/source/ic7TPfwzIwPT3tSX3n8lRvHYiRK',
          regions: [
            [210, 90, 200, 390, 'vulture'],
            [540, 130, 165, 350, 'vulture']
          ]
        },
        {
          url:
            'https://strato.dev.bigml.com/shared/source/603d01f0520f907e510000c3/image/source/ic7TPfwzIwPT3tSX3n8lRvHYiRK',
          regions: [
            [155, 70, 200, 300, 'bonelli'],
            [640, 540, 140, 235, 'bonelli']
          ]
        },
        {
          url:
            'https://strato.dev.bigml.com/shared/source/603d01f0520f907e8100009b/image/source/ic7TPfwzIwPT3tSX3n8lRvHYiRK',
          regions: [
            [300, 130, 250, 415, 'imperial'],
            [465, 85, 325, 390, 'imperial']
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
    openModal: function (bird) {
      if (bird) this.selectedBird = bird
      this.dialog = true
    },
    closeModal: function () {
      this.dialog = false
      this.$refs.idialog.editingMode = false
      this.$refs.idialog.resetImage()
    }
  }
}
</script>
