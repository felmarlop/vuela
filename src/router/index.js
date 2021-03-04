import NotFound from '../components/NotFound.vue'
import User from '../components/User.vue'
import UserBirds from '../components/UserBirds.vue'
import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  { path: '*', component: NotFound },
  { path: '/user/:name', component: User, children: [{ path: 'birds', component: UserBirds }] }
]

const router = new VueRouter({
  mode: 'history',
  routes
})

export default router
