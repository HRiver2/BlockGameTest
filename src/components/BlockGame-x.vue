<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import 'animate.css'

const config = reactive({
  cols: 6,
  rows: 15,
  colors: 5,
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
        >五彩绳道具：跳过新增 ({{ powerUps.noNewRow }})</button>
        <button
          :disabled="powerUps.rowClear === 0"
          :class="{ active: power==='rowClear' }"
          @click="power='rowClear'"
        >龙舟道具：整行清除 ({{ powerUps.rowClear }})</button>
        <button
          :disabled="powerUps.areaClear === 0"
          :class="{ active: power==='areaClear' }"
          @click="power='areaClear'"
        >炸弹道具：3×3 消除 ({{ powerUps.areaClear }})</button>
        <button @click="initGame">重新开始</button>
        <button>返回主页</button>
        <button>排行榜</button>
      </aside>
    </div>

    <div v-if="isGameOver" class="game-over">
      <div class="message">游戏结束!</div>
      <div class="final-score">最终分数: {{ score }}</div>
      <button @click="initGame">再玩一次</button>
    </div>
  </div>
</template>

<style scoped>
.game-wrapper {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}
.game-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}
.game-container {
  position: relative;
  flex: 1;
  min-width: 0;
  height: 60vh;
  max-height: 80vh;
  aspect-ratio: 6 / 15;
  display: flex;
  overflow: hidden;
  background-color: #7C7C7C;
}
.block {
  position: absolute;
  border-radius: 0;
  cursor: pointer;
  aspect-ratio: 1 / 1;
  display: flex;
}
.sidebar {
  flex-shrink: 0;
  width: 200px;
  background: #ececec;
  padding: 8px;
  border-radius: 4px;
}
.sidebar h2 {
  margin: 0 0 8px;
  font-size: 200%;
  color: #414052;
}
.sidebar button {
  display: block;
  width: 100%;
  margin-bottom: 10px;
  padding: 20px 10px;
  font-size: 14px;
  cursor: pointer;
  background-color: #9f9db7;
}
.sidebar button.active {
  background: #4caf50; color: #fff;
}
.sidebar button:disabled {
  opacity: 0.5; cursor: not-allowed;
}

.color-1 { background: #FF5252 }
.color-2 { background: #448AFF }
.color-3 { background: #66BB6A }
.color-4 { background: #FFCA28 }
.color-5 { background: #AB47BC }

.game-over {
  position: absolute; inset: 0; background: rgba(0,0,0,0.7);
  display: flex; flex-direction: column;
  justify-content: center; align-items: center;
  color: #fff; font-size: 24px;
  backdrop-filter: blur(10px);
}
.game-over .message {
  font-size: 32px;
  margin-bottom: 12px
}
.game-over .final-score {
  margin-bottom: 16px
}
.game-over button {
  margin-top: 8px;
}
</style>