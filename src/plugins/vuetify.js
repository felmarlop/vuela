import Vue from 'vue'
import Vuetify from 'vuetify'

Vue.use(Vuetify)

const theme = {
  primary: '#007AFF',
  secondary: '#9C27b0',
  accent: '#9C27b0',
  info: '#00CAE3'
}

export default new Vuetify({
  theme: {
    themes: {
      dark: theme,
      light: theme
    }
  }
})
