<script setup lang="ts">
import Home from '../components/home.vue'
import 'animate.css'
</script>

<template>
    <div class="container">
        <Home />
    </div>
</template>

<style scoped>
.container {
  width: 100vw;
  height: 100vh;
  background: url('../assets/image/home.jpg') no-repeat center/cover;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>