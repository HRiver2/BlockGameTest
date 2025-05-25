<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';

const config = reactive({
  cols: 6,
  rows: 15,
  colors: 5,
  initialRows: 2,
  newRowInterval: 1,
  fallingSpeed: 50
});

const grid = ref<Array<Array<number | null>>>([]);
const score = ref(0);
const moves = ref(0);
const isGameOver = ref(false);
const isAnimating = ref(false);

const horizontalSize = computed(() => 100 / config.cols);
const verticalSize = computed(() => 100 / config.rows);

const blockSize = computed(() => 100 / config.cols);

function randomColor() {
  return Math.floor(Math.random() * config.colors) + 1;
}


function initGame() {
  grid.value = Array.from({ length: config.rows }, () =>
    Array(config.cols).fill(null)
  );
  
  score.value = 0;
  moves.value = 0;
  isGameOver.value = false;
  isAnimating.value = false;
  
  // 仅填充底部 initialRows 行的方块
  for (let row = config.rows - config.initialRows; row < config.rows; row++) {
    for (let col = 0; col < config.cols; col++) {
      grid.value[row][col] = randomColor();
    }
  }
}

/**
 * 添加新的一行方块：先将所有方块上移一行，
 * 然后在底部行填充新随机方块
 */
function addNewRow() {
  if (isTopRowOccupied()) {
    gameOver();
    return;
  }
  
  // 上移所有行
  for (let row = 0; row < config.rows - 1; row++) {
    for (let col = 0; col < config.cols; col++) {
      grid.value[row][col] = grid.value[row + 1][col];
    }
  }
  
  // 底部填充新的一行
  const bottomRow = config.rows - 1;
  for (let col = 0; col < config.cols; col++) {
    grid.value[bottomRow][col] = randomColor();
  }
}

// 1. 新增道具系统状态
const powerUps = reactive({
  noNewRow: 1,    // 道具1：下次消除不新增行
  rowClear: 1,    // 道具2：消除整行
  areaClear: 1    // 道具3：3×3 范围消除
});
const selectedPower = ref<'none'|'noNewRow'|'rowClear'|'areaClear'>('none');
// 用于「下次消除不新增行」
const skipNextRow = ref(false);

/**
 * 处理方块点击事件
 */
 function handleBlockClick(row: number, col: number) {
  if (isAnimating.value || isGameOver.value) return;
  // 如果点击空格直接返回
  if (!grid.value[row][col] && selectedPower.value === 'none') return;

  isAnimating.value = true;

  // 根据选中道具执行
  switch (selectedPower.value) {
    case 'noNewRow':
      // 按常规找到要消除的连块
      removeBlocks(findConnectedBlocks(row, col, grid.value[row][col]!));
      skipNextRow.value = true;
      powerUps.noNewRow--;
      break;
    case 'rowClear':
      removeWholeRow(row);
      powerUps.rowClear--;
      break;
    case 'areaClear':
      removeArea(row, col);
      powerUps.areaClear--;
      break;
    default:
      // 普通消除
      const connected = findConnectedBlocks(row, col, grid.value[row][col]!);
      removeBlocks(connected);
      score.value += Math.pow(connected.length, 2) * 10;
  }

  // 使用完毕重置选中
  selectedPower.value = 'none';

  // 延迟处理下落和新行
  setTimeout(() => {
    handleBlocksFall();
    moves.value++;

    // 非使用了「跳过新增行」时才新增
    if (!skipNextRow.value && moves.value % config.newRowInterval === 0) {
      addNewRow();
    }
    skipNextRow.value = false;

    if (isTopRowOccupied()) {
      gameOver();
    } else {
      isAnimating.value = false;
    }
  }, config.fallingSpeed);
}

/**
 * 查找与指定方块相连的同色方块
 */
function findConnectedBlocks(row: number, col: number, colorId: number, visited: Set<string> = new Set()) {
  const key = `${row},${col}`;
  if (
    row < 0 || row >= config.rows ||
    col < 0 || col >= config.cols ||
    grid.value[row][col] !== colorId ||
    visited.has(key)
  ) {
    return [];
  }
  visited.add(key);
  const result = [{row, col}];
  const directions = [[-1, 0], [0, 1], [1, 0], [0, -1]];
  for (const [dr, dc] of directions) {
    result.push(...findConnectedBlocks(row + dr, col + dc, colorId, visited));
  }
  return result;
}

/**
 * 消除指定方块
 */
function removeBlocks(blocks: Array<{row: number, col: number}>) {
  blocks.forEach(({ row, col }) => {
    grid.value[row][col] = null;
  });
}

/**
 * 处理方块下落逻辑
 */
function handleBlocksFall() {
  for (let col = 0; col < config.cols; col++) {
    let emptySpaces = 0;
    for (let row = config.rows - 1; row >= 0; row--) {
      if (grid.value[row][col] === null) {
        emptySpaces++;
      } else if (emptySpaces > 0) {
        grid.value[row + emptySpaces][col] = grid.value[row][col];
        grid.value[row][col] = null;
      }
    }
  }
}

/**
 * 检查顶行是否有方块
 */
function isTopRowOccupied() {
  for (let col = 0; col < config.cols; col++) {
    if (grid.value[0][col] !== null) return true;
  }
  return false;
}

/**
 * 游戏结束处理
 */
function gameOver() {
  isGameOver.value = true;
}

// 2. 新增辅助函数
function removeWholeRow(row: number) {
  for (let col = 0; col < config.cols; col++) {
    grid.value[row][col] = null;
  }
}
function removeArea(row: number, col: number) {
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const r = row + dr, c = col + dc;
      if (r >= 0 && r < config.rows && c >= 0 && c < config.cols) {
        grid.value[r][c] = null;
      }
    }
  }
}

onMounted(() => {
  initGame();
});
</script>

<template>
  <div class="game-wrapper">
    <h1>方块消除游戏</h1>
    <div class="game-info">
      <div class="score">分数: {{ score }}</div>
      <button @click="initGame">重新开始</button>
    </div>

    <div class="game-content">
      <transition-group
        name="block"
        tag="div"
        class="game-container"
        appear
      >
        <div
          v-for="(colorId, idx) in grid.flat()"
          :key="`${Math.floor(idx/config.cols)}-${idx%config.cols}`"
          v-if="colorId !== null"
          class="block"
          :class="`color-${colorId}`"
          :style="{
            left:  `${(idx % config.cols) * horizontalSize}%`,
            top:   `${Math.floor(idx / config.cols) * horizontalSize}%`,
            width: `${horizontalSize}%`,
            height:`${horizontalSize}%`
          }"
          @click="handleBlockClick(Math.floor(idx/config.cols), idx%config.cols)"
        ></div>
      </transition-group>

      <!-- 4. 侧边栏：道具选择 -->
      <aside class="sidebar">
        <h2>道具</h2>
        <button
          :disabled="powerUps.noNewRow === 0"
          :class="{ active: selectedPower==='noNewRow' }"
          @click="selectedPower='noNewRow'"
        >
          跳过新增 ({{ powerUps.noNewRow }})
        </button>
        <button
          :disabled="powerUps.rowClear === 0"
          :class="{ active: selectedPower==='rowClear' }"
          @click="selectedPower='rowClear'"
        >
          整行清除 ({{ powerUps.rowClear }})
        </button>
        <button
          :disabled="powerUps.areaClear === 0"
          :class="{ active: selectedPower==='areaClear' }"
          @click="selectedPower='areaClear'"
        >
          3×3 消除 ({{ powerUps.areaClear }})
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

<style scoped>
/* 游戏布局 */
.game-content {
  display: flex;
  align-items: flex-start;
}

/* 侧边栏样式 */
.sidebar {
  margin-left: 16px;
  padding: 8px;
  width: 100px;
  background: #ececec;
  border-radius: 4px;
}
.sidebar h2 {
  margin: 0 0 8px;
  font-size: 16px;
}
.sidebar button {
  display: block;
  width: 100%;
  margin-bottom: 6px;
  padding: 6px;
  font-size: 14px;
}
.sidebar button.active {
  background: #4caf50;
  color: white;
}
.sidebar button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

<style>
  /* leave this 全局动画，不要加 scoped */
  .block-enter-from,
  .block-appear-from { opacity: 0; transform: translateY(20%); }
  .block-enter-to,
  .block-appear-to   { opacity: 1; transform: translateY(0); }
  .block-leave-from  { opacity: 1; transform: translateY(0); }
  .block-leave-to    { opacity: 0; transform: translateY(20%); }
  .block-move        { transition: transform .3s ease; }
  .block-enter-active,
  .block-appear-active,
  .block-leave-active { transition: all .3s ease; }
</style>

<!-- 2. 组件私有样式 -->
<style scoped>
.game-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.game-container {
  position: relative;
  width: 100%;
  aspect-ratio: 6 / 15;
  background-color: #f0f0f0;
  overflow: hidden;
}

.block {
  position: absolute;
  border-radius: 0;
  cursor: pointer;
}

.sidebar {
  width: 120px;
  padding: 8px;
  background: #ececec;
  border-radius: 4px;
  flex-shrink: 0;
}
.sidebar h3 {
  margin: 0 0 8px;
  font-size: 16px;
}
.sidebar button {
  display: block;
  width: 100%;
  margin-bottom: 8px;
  padding: 6px;
  font-size: 14px;
  cursor: pointer;
}
.sidebar button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 方块颜色 */
.color-1 { background-color: #FF5252; }
.color-2 { background-color: #448AFF; }
.color-3 { background-color: #66BB6A; }
.color-4 { background-color: #FFCA28; }
.color-5 { background-color: #AB47BC; }

</style>
 
<style scoped>
.game-wrapper {
  text-align: center;
  max-width: 500px;
  width: 100%;
  margin: 0 auto;
}

h1 {
  margin-bottom: 20px;
  color: #333;
}

.game-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-size: 18px;
}

.game-container {
  position: relative;
  width: 100%;
  aspect-ratio: 6 / 15;
  background-color: #f0f0f0;
  border-radius: 5px;
  overflow: hidden;
  margin: 20px auto 0;
}

.block {
  position: absolute;
  border-radius: 0;
  cursor: pointer;
  /* transition: transform 0.2s, opacity 0.2s; */
}

/* 其他颜色定义保持不变 */
.color-1 { background-color: #FF5252; }
.color-2 { background-color: #448AFF; }
.color-3 { background-color: #66BB6A; }
.color-4 { background-color: #FFCA28; }
.color-5 { background-color: #AB47BC; }

button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background-color: #45a049;
}

.game-over {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 24px;
}

.game-over .message {
  font-size: 32px;
  margin-bottom: 20px;
}

.game-over .final-score {
  margin-bottom: 30px;
}

/* 响应式设计 */
@media (max-width: 500px) {
  .game-container {
    height: 400px;
  }
  
  .game-info {
    font-size: 16px;
  }
}
</style>