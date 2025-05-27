<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import 'animate.css'

const config = reactive({
  cols: 6,
  rows: 15,
  colors: 4,
  initialRows: 2,
  newRowInterval: 1,
  fallingSpeed: 50
})

const cols = config.cols
const rows = config.rows

const grid = ref<number[][]>([])
const score = ref(0)
const moves = ref(0)
const isGameOver = ref(false)
const isAnimating = ref(false)

const powerUps = reactive({ noNewRow: 1, rowClear: 1, areaClear: 1 })
const power = ref<'none'|'noNewRow'|'rowClear'|'areaClear'>('none')
const skipNext = ref(false)

const sizeW = computed(() => 100 / cols)
const sizeH = computed(() => 100 / rows)

const offset = computed(() => rows - config.initialRows)

const cells = computed(() =>
  grid.value.flatMap((row, r) =>
    row.map((color, c) => ({ r, c, color }))
  ).filter(cell => cell.color !== null)
)

function randomColor() {
  return Math.floor(Math.random() * config.colors) + 1
}

function initGame() {
  grid.value = Array.from({ length: rows }, () => Array(cols).fill(null))
  score.value = 0
  moves.value = 0
  isAnimating.value = false
  isGameOver.value = false
  power.value = 'none'
  skipNext.value = false
  powerUps.noNewRow = 1
  powerUps.rowClear = 1
  powerUps.areaClear = 1

  for (let r = rows - config.initialRows; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      grid.value[r][c] = randomColor()
    }
  }
}

function isTopFull() {
  return grid.value[0].some(cell => cell !== null)
}

function gameOver() {
  isGameOver.value = true
}

function findConn(r: number, c: number, color: number, seen = new Set<string>()) {
  const k = `${r},${c}`
  if (r<0||r>=rows||c<0||c>=cols||grid.value[r][c]!==color||seen.has(k)) return []
  seen.add(k)
  let res = [{ r, c }]
  for (const [dr,dc] of [[1,0],[-1,0],[0,1],[0,-1]]) {
    res = res.concat(findConn(r+dr, c+dc, color, seen))
  }
  return res
}

function remove(cells: {r:number,c:number}[]) {
  cells.forEach(({r,c}) => grid.value[r][c] = null)
}

function fall() {
  for (let c = 0; c < cols; c++) {
    let empty = 0
    for (let r = rows-1; r >= 0; r--) {
      if (grid.value[r][c]===null) empty++
      else if (empty>0) {
        grid.value[r+empty][c] = grid.value[r][c]
        grid.value[r][c] = null
      }
    }
  }
}

function addRow() {
  if (isTopFull()) { gameOver(); return }
  for (let r = 0; r < rows-1; r++) {
    grid.value[r] = [...grid.value[r+1]]
  }
  grid.value[rows-1] = Array.from({ length: cols }, () => randomColor())
}

function onClick(r: number, c: number) {
  if (isAnimating.value || isGameOver.value) return
  if (grid.value[r][c]===null && power.value==='none') return

  isAnimating.value = true

  switch (power.value) {
    case 'noNewRow':
      remove(findConn(r, c, grid.value[r][c]!))
      skipNext.value = true
      powerUps.noNewRow--
      break
    case 'rowClear':
      grid.value[r].fill(null)
      powerUps.rowClear--
      break
    case 'areaClear':
      for (let dr=-1; dr<=1; dr++)
        for (let dc=-1; dc<=1; dc++)
          if (r+dr>=0&&r+dr<rows&&c+dc>=0&&c+dc<cols)
            grid.value[r+dr][c+dc] = null
      powerUps.areaClear--
      break
    default:
      const conn = findConn(r, c, grid.value[r][c]!)
      if (conn.length) {
        remove(conn)
        score.value += conn.length * conn.length * 10
      }
  }

  power.value = 'none'

  setTimeout(() => {
    fall()
    moves.value++
    if (!skipNext.value && moves.value % config.newRowInterval === 0) {
      addRow()
    }
    skipNext.value = false
    if (isTopFull()) gameOver()
    else isAnimating.value = false
  }, config.fallingSpeed)
}

onMounted(initGame)
</script>

<template>
  <div class="game-wrapper">
    <div class="top-buttons">
      <button @click="initGame">
        <svg t="1748148242992" class="icon" viewBox="0 0 1122 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7482" width="24" height="24">
          <path d="M631.338346 95.778647V19.24812L349.08391 195.560902 631.338346 372.027669v-132.581052c141.050226 32.182857 246.99188 158.142556 246.99188 309.047819 0 175.080902-142.43609 317.516992-317.516993 317.516993S243.296241 723.421353 243.296241 548.494436c0-38.958195-31.566917-70.525113-70.525113-70.525113-38.958195 0-70.525113 31.566917-70.525113 70.525113C102.09203 801.337744 307.969925 1007.061654 560.813233 1007.061654S1019.380451 801.337744 1019.380451 548.494436c0-228.821654-168.613534-418.685113-388.042105-452.715789z" p-id="7483" fill="#8a8a8a"></path>
        </svg>
      </button>
      <button @click="$router ? $router.push('/home') : null">
        <svg t="1748147655205" class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
          <path d="M1012.646039 459.30735 535.153 8.876259c-10.824779-11.426156-28.264701-12.027532-39.690857-0.601377L12.556714 458.104597c-7.216519 6.013766-12.027532 16.237169-12.027532 27.663325 0 19.244052 13.831662 34.278468 30.670208 34.278468l108.849169 0 0 354.812208c0 40.89361 15.034416 78.178961 39.089481 105.240909 24.055065 27.061948 57.130779 43.900494 93.814753 43.900494l117.268442 0 0-144.33039 0-272.423611c0-10.824779 4.209636-21.048182 10.223403-28.264701 6.615143-7.216519 15.635792-12.027532 25.257818-12.027532l174.399221 0c9.622026 0 18.642675 4.811013 25.257818 12.027532 6.615143 7.216519 10.223403 17.439922 10.223403 28.264701l0 416.754 159.966182 0 3.60826 0 4.209636 0c22.250935 0 42.69774-10.223403 57.732156-27.061948 15.034416-16.838545 24.055065-39.690857 24.055065-64.948675L885.154195 520.046389 992.800611 520.046389l0 0c9.020649 0 17.439922-4.209636 23.453688-12.027532C1027.079078 492.984441 1025.274949 471.334883 1012.646039 459.30735zM178.536662 452.692207l1.202753 0 0 0.601377C179.739415 453.293584 179.138039 453.293584 178.536662 452.692207z" fill="#8a8a8a"/>
        </svg>
      </button>
    </div>
    <div class="game-content">
      <transition-group
        tag="div"
        class="game-container"
        appear
        type="animation"
        enter-active-class="animate__animated animate__fadeInUp"
        leave-active-class="animate__animated animate__backOutDown"
      >
        <div
          v-for="cell in cells"
          :key="`${cell.r}-${cell.c}`"
          class="block"
          :class="`color-${cell.color}`"
          :style="{
            left:   `${cell.c * sizeW}%`,
            bottom: `${(rows - 1 - cell.r) * sizeH}%`,
            width:  `${sizeW}%`
          }"
          @click="onClick(cell.r, cell.c)"
        ></div>
      </transition-group>

      <aside class="sidebar">
        <h2>分数: {{ score }}</h2>
        <button
          :disabled="powerUps.noNewRow === 0"
          :class="{ active: power==='noNewRow' }"
          @click="power='noNewRow'"
        >
        <img src="../assets/image/no-new-row.jpg" class="skill-icon" alt="跳过新增" />
        </button>
        <button
          :disabled="powerUps.rowClear === 0"
          :class="{ active: power==='rowClear' }"
          @click="power='rowClear'"
        >
        <img src="../assets/image/row-clear.jpg" class="skill-icon" alt="整行清除" />
        </button>
        <button
          :disabled="powerUps.areaClear === 0"
          :class="{ active: power==='areaClear' }"
          @click="power='areaClear'"
        >
        <img src="../assets/image/area-clear.jpg" class="skill-icon" alt="3×3 消除" />
        </button>
      </aside>
    </div>

    <div v-if="isGameOver" class="game-over">
      <div class="message">游戏结束!</div>
      <div class="final-score">最终分数: {{ score }}</div>
      <button @click="initGame">再玩一次</button>
    </div>
  </div>
</template>

<style lang="css">
  @font-face {
  font-family: 'MyCustomFont';
  src: url('../assets/font/默陌雅诗.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
</style>

<style scoped>
.game-wrapper {
  font-family: 'MyCustomFont', sans-serif;
  /* width: 100%; */
  width:auto;
  height: auto;
  margin: 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /* background-color: #f5f5f5; */
  /* background-image: url(${bgUrl}); */
}

.game-content {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 16px;
  flex: 1;
  /* flex-wrap: wrap; */
}

.game-container {
  position: relative;
  flex: 1 1 auto;
  min-width: 0;
  height: 85vh;
  max-height: 100vh;
  aspect-ratio: 6 / 15;
  display: flex;
  overflow: hidden;
  background-color: #ffffff80;
  backdrop-filter: blur(10px);
}

.block {
  position: absolute;
  border-radius: 10px;
  cursor: pointer;
  aspect-ratio: 1 / 1;
  display: flex;
}

.sidebar {
  flex-shrink: 0;
  width: 20vw;
  max-width: 200px;
  background-color: #ffffff80;
  backdrop-filter: blur(10px);
  padding: 8px;
  border-radius: 10px;
}

.sidebar h2 {
  margin: 0 0 8px;
  font-size: 200%;
  color: #414052;
}

.sidebar button {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-bottom: 10px;
  padding: 20px 10px;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 10px;
}

.sidebar button.active {
  background: #4caf5050; color: #fff;
}

.sidebar button:disabled {
  opacity: 0.2; cursor: not-allowed;
}

.sidebar button img.skill-icon {
  vertical-align: middle;
  width: 50px;
  height: 50px;
  object-fit: cover;
  margin-bottom: 6px;
}

@media (max-width: 500px) {
    .sidebar {
      padding: 4px;
      font-size: 0.8rem;
    }
    .sidebar h2 {
      font-size: 2rem;
    }
}

.top-buttons button {
  margin: 10px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  background-color: #ffffff80;
  backdrop-filter: blur(10px);
  color: #000;
  border: none;
  border-radius: 4px;
}

.color-1 {
  background-image: url('../assets/image/block1.jpg');
  background-size: cover;
  background-position: center; 
}

.color-2 {
  background-image: url('../assets/image/block2.jpg');
  background-size: cover;
  background-position: center; 
}

.color-3 {
  background-image: url('../assets/image/block3.jpg');
  background-size: cover;
  background-position: center; 
}

.color-4 {
  background-image: url('../assets/image/block4.jpg');
  background-size: cover;
  background-position: center; 
}

.game-over {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 24px;
  backdrop-filter:
  blur(10px);
}

.game-over .message {
  font-size: 50px;
  margin-bottom: 12px
}

.game-over .final-score {
  margin-bottom: 16px
}

.game-over button {
  margin-top: 8px;
}
</style>