<script setup lang="ts">
import Board from '../components/rankBoard.vue'
import 'animate.css'
</script>

<template>
    <div class="containerB">
      <Board />
    </div>
</template>

<style>
.containerB {
  width: 100vw;
  height: 100vh;
  background: url('../assets/image/rank.jpg') no-repeat center/cover;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>