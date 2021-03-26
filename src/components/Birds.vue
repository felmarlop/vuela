<template>
  <div class="birds_wrapper mt-6 mb-6">
    <v-text-field
      v-model="hash"
      label="Type your BigML composite hash"
      outlined
      :style="{ margin: '0 auto', width: '50%' }"
      @change="listBirds()"
    ></v-text-field>
    <transition-group name="image-list" class="birds" appear v-if="birds.length">
      <bird :key="'grid_' + b.url" :bird="b" @open-modal="openModal(b, index)" v-for="(b, index) in birds" />
    </transition-group>
    <div class="loading" v-if="!birds.length && loadingMsg">{{ loadingMsg }}</div>
    <idialog
      ref="idialog"
      :dialog="dialog"
      :bird="selectedBird"
      :bird-index="birdIndex"
      :bird-length="birds.length"
      :labels="labels"
      @set-bird="setBird"
      @update-bird="updateBird"
      @close-modal="closeModal"
      @update-labels="updateLabels"
    />
    <v-btn @click="shuffle(true)" v-show="birds.length">Shuffle</v-btn>
  </div>
</template>

<script>
import Bird from './Bird.vue'
import ImageDialog from './Dialog.vue'
import _ from 'lodash'
import axios from 'axios'

let shuffleInterval

export default {
  name: 'Birds',
  components: {
    bird: Bird,
    idialog: ImageDialog
  },
  data: function () {
    return {
      birds: [],
      labels: ['goshawk', 'golden', 'snake eagle', 'imperial', 'vulture', 'bonelli'],
      hash: 'nEpbDVV2FsapcNUeQ6HCdWmQr3H',
      selectedBird: null,
      birdIndex: 0,
      dialog: false,
      loadingMsg: ''
    }
  },
  created: function () {
    this.resetInterval()
  },
  mounted: function () {
    this.listBirds()
  },
  methods: {
    listBirds: function () {
      let cpnt = this
      this.birds = []
      if (!this.hash) {
        this.loadingMsg = ''
        return false
      }

      this.loadingMsg = 'Loading...'
      axios
        .get('https://localhost:1026/andromeda/shared/source/' + this.hash + '?exclude=sources;parent_optype=!image')
        .then(function (response) {
          let fields = response.data['fields'],
            preview = response.data['fields_preview'],
            idx = 0,
            keys,
            ids,
            rgs
          if (preview) {
            keys = Object.keys(preview)
            while (idx < keys.length) {
              if (fields[keys[idx]].optype == 'image') {
                ids = preview[keys[idx]]
              }
              if (fields[keys[idx]].optype == 'regions') {
                rgs = preview[keys[idx]]
              }
              idx++
            }
          }
          if (ids && rgs && ids.length == rgs.length) {
            idx = 0
            while (idx < ids.length) {
              cpnt.birds.push({
                url: 'http://localhost:1025/shared/source/' + ids[idx] + '/image/source/' + cpnt.hash,
                regions: rgs[idx]
              })
              idx++
            }
          }
          cpnt.loadingMsg = cpnt.birds.length ? '' : 'There are no images'
        })
        .catch(function () {
          cpnt.loadingMsg = 'An error happened retrieving the birds...'
        })
    },
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
    setBird: function (idx) {
      this.selectedBird = this.birds[idx]
      this.birdIndex = idx
      if (this.$refs.idialog.$refs.birdComponent) {
        this.$refs.idialog.$refs.birdComponent.resetZoom()
      }
    },
    updateBird: function (newBird) {
      this.selectedBird = newBird
      this.birds[this.birdIndex] = newBird
    },
    openModal: function (bird, idx) {
      if (this.dialog) {
        this.dialog = false
        return false
      }
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
