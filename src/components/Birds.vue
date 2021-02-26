<template>
    <div class="birds_wrapper">
        <transition-group name="image-list" class="birds" appear>
            <Bird v-for="b in birds" v-bind:key="b.url" v-bind:bird="b" v-on:openModal="openModal" ></Bird>
        </transition-group>
        <Dialog v-bind:dialog="dialog" v-bind:bird="selectedBird" v-on:closeModal="closeModal"/>
        <button @click="shuffle">Shuffle</button>
    </div>
</template>

<script>
import Bird from './Bird.vue';
import Dialog from './Dialog.vue';
import _ from 'lodash';

export default {
    name: 'Birds',
    data: function() {
        return {
            birds: [
                {
                  'url': "https://strato.dev.bigml.com/shared/source/6033c212520f907ec900000a/image/source/gAQAq4BfCMxA4EuP8msKSt7OoXh",
                  'regions': []
                },
                {
                  'url': "https://strato.dev.bigml.com/shared/source/6033c212520f907ec900000d/image/source/gAQAq4BfCMxA4EuP8msKSt7OoXh",
                  'regions': []
                },
                {
                  'url': "https://strato.dev.bigml.com/shared/source/6033c212520f907ec9000007/image/source/gAQAq4BfCMxA4EuP8msKSt7OoXh",
                  'regions': []
                },
                {
                  'url': "https://strato.dev.bigml.com/shared/source/6033ef65520f907ef3000004/image/source/gAQAq4BfCMxA4EuP8msKSt7OoXh",
                  'regions': []
                },
                {
                  'url': "https://strato.dev.bigml.com/shared/source/6033c213520f907ec9000010/image/source/gAQAq4BfCMxA4EuP8msKSt7OoXh",
                  'regions': []
                }
            ],
            selectedBird: null,
            dialog: false
        }
    },
    components: {
        Bird,
        Dialog
    },
    methods: {
        shuffle: function () {
          this.birds = _.shuffle(this.birds)
        },
        openModal: function(bird) {
          if (bird) this.selectedBird = bird
          this.dialog = true
        },
        closeModal: function() {
          this.dialog = false
        }
    }
};
</script>