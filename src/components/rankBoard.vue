<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Entry {
  name: string
  score: number
}

const entries = ref<Entry[]>([])

const sortedEntries = computed(() =>
  [...entries.value]
    .sort((a, b) => b.score - a.score)
)

onMounted(() => {
  entries.value = [
    { name: 'Tracya',   score: 1500 },
    { name: 'Synya',     score: 1200 },
    { name: 'Nagasaki', score:  900 },
    { name: 'Kanade', score:  888 },
    { name: 'Enana', score:  870 },
    { name: 'Yukino', score:  800 },
    { name: 'Haruka', score:  600 }
  ]
})
</script>

<template>
  <div class="leaderboard">
    <div class="entry-list">
      <div
        v-for="(entry, idx) in sortedEntries"
        :key="entry.name"
        class="entry-card"
      >
        <div class="rank">#{{ idx + 1 }}</div>
        <div class="player">{{ entry.name }}</div>
        <div class="score">{{ entry.score }}</div>
      </div>
    </div>
  </div>
  <div class="btn">
    <button @click="$router ? $router.push('/home') : null">
        <svg t="1748147655205" class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
          <path d="M1012.646039 459.30735 535.153 8.876259c-10.824779-11.426156-28.264701-12.027532-39.690857-0.601377L12.556714 458.104597c-7.216519 6.013766-12.027532 16.237169-12.027532 27.663325 0 19.244052 13.831662 34.278468 30.670208 34.278468l108.849169 0 0 354.812208c0 40.89361 15.034416 78.178961 39.089481 105.240909 24.055065 27.061948 57.130779 43.900494 93.814753 43.900494l117.268442 0 0-144.33039 0-272.423611c0-10.824779 4.209636-21.048182 10.223403-28.264701 6.615143-7.216519 15.635792-12.027532 25.257818-12.027532l174.399221 0c9.622026 0 18.642675 4.811013 25.257818 12.027532 6.615143 7.216519 10.223403 17.439922 10.223403 28.264701l0 416.754 159.966182 0 3.60826 0 4.209636 0c22.250935 0 42.69774-10.223403 57.732156-27.061948 15.034416-16.838545 24.055065-39.690857 24.055065-64.948675L885.154195 520.046389 992.800611 520.046389l0 0c9.020649 0 17.439922-4.209636 23.453688-12.027532C1027.079078 492.984441 1025.274949 471.334883 1012.646039 459.30735zM178.536662 452.692207l1.202753 0 0 0.601377C179.739415 453.293584 179.138039 453.293584 178.536662 452.692207z" fill="#8a8a8a"/>
        </svg>
    </button>
  </div>
</template>

<style scoped>
.leaderboard {
  width: 70vw;
  margin: 10rem auto 2rem;
  padding: 2rem;
  background: #ffffff60;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.entry-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.entry-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.rank {
  font-weight: bold;
  color: #555;
  width: 36px;
  text-align: center;
}

.player {
  flex: 1;
  margin: 0 1rem;
  color: #333;
}

.score {
  font-weight: bold;
  color: #4caf50;
}

.btn {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: #ffffff50;
}
</style>