import VueRouter from 'vue-router'

const routes = [
  { path: '/foo', component: {template: '<div>foo</div>'} },
  { path: '/bar', component: {template: '<div>bar</div>'}  }
]

const router = new VueRouter({
  mode: 'history',
  base: '/',
  routes,
  linkActiveClass: 'active'
})

export default router
