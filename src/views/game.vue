<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BlockGame from '../components/BlockGame-x2.vue'
import 'animate.css'

import bg1 from '../assets/image/bg1.jpg'
import bg2 from '../assets/image/bg2.jpg'
import bg3 from '../assets/image/bg3.jpg'
import bg4 from '../assets/image/bg4.jpg'
import bg5 from '../assets/image/bg5.jpg'
import bg6 from '../assets/image/bg6.jpg'
import bg7 from '../assets/image/bg7.jpg'
import bg8 from '../assets/image/bg8.jpg'

const backgrounds = [bg1, bg2, bg3, bg4, bg5, bg6, bg7, bg8,]
const bgUrl = ref<string>('')

onMounted(() => {
  bgUrl.value = backgrounds[
    Math.floor(Math.random() * backgrounds.length)
  ]
})
</script>

<template>
  <main
    class="game-page"
    :style="{
      backgroundImage: `url(${bgUrl})`,
      backgroundSize: '100% 100%',
      backgroundRepeat: 'no-repeat'
    }"
  >
    <BlockGame />
  </main>
</template>

<style scoped>
.game-page {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>