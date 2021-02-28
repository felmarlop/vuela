<template>
  <div class="birds_wrapper">
    <transition-group name="image-list" class="birds" appear>
      <bird :key="b.url" :bird="b" @open-modal="openModal" v-for="b in birds" />
    </transition-group>
    <idialog :dialog="dialog" :bird="selectedBird" @close-modal="closeModal" />
    <v-btn @click="shuffle">Shuffle</v-btn>
  </div>
</template>

<script>
import Bird from './Bird.vue'
import ImageDialog from './Dialog.vue'
import _ from 'lodash'
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
      selectedBird: null,
      dialog: false
    }
  },
  methods: {
    shuffle: function () {
      this.birds = _.shuffle(this.birds)
    },
    openModal: function (bird) {
      if (bird) this.selectedBird = bird
      this.dialog = true
    },
    closeModal: function () {
      this.dialog = false
    }
  }
}
</script>
