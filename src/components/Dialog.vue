<template>
  <v-dialog
    v-model="dialog"
    fullscreen
    hide-overlay
    transition="dialog-bottom-transition"
    content-class="image_dialog"
  >
    <v-card>
      <v-toolbar
        dark
        color="primary"
      >
        <v-btn
          icon
          dark
          @click="$emit('closeModal')"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Nice image</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn
            dark
            text
            @click="$emit('closeModal')"
          >
            Close
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-subheader>Aguilucho.jpg</v-subheader>
      <v-divider></v-divider>
      <Bird v-if="bird" v-bind:key="bird.url" v-bind:bird="bird" v-bind:raw="true" v-bind:dialog="true"></Bird>
    </v-card>
  </v-dialog>
</template>

<script>
  import Bird from './Bird.vue';
  export default {
    props: ['dialog', 'bird'],
    components: { Bird }
  };
</script>