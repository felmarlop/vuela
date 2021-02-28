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
      <bird :key="bird.url" :bird="bird" :raw="true" :expanded="true" v-if="bird"></bird>
    </v-card>
  </v-dialog>
</template>

<script>
import Bird from './Bird.vue'
export default {
  components: { bird: Bird },
  props: {
    dialog: Boolean,
    bird: {
      type: Object,
      default: null
    }
  }
}
</script>
