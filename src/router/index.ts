import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/home.vue'
import Game from '../views/game.vue'
import Rank from '../views/rankBoard.vue'

const routes = [
//   { path: '/',    name: 'Home', component: Home },
  { path: '/home',    name: 'Home', component: Home },
  { path: '/game', name: 'Game', component: Game },
  { path: '/rankboard', component: Rank },
  {path: '/:pathMatch(.*)*', redirect: '/home'}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router