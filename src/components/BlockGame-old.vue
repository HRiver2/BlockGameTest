<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';

const config = reactive({
  cols: 6,          // 列数
  rows: 15,          // 行数
  colors: 5,         // 颜色数量
  initialRows: 2,    // 初始只在底部填充5
  newRowInterval: 1, // 每消除多少次添加新行
  fallingSpeed: 50  // 方块下落速度(ms)
});

// 游戏状态
const grid = ref<Array<Array<number | null>>>([]);
const score = ref(0);
const moves = ref(0);
const isGameOver = ref(false);
const isAnimating = ref(false);
// 横向尺寸（百分比）
const horizontalSize = computed(() => 100 / config.cols);
// 纵向尺寸（百分比），基于行数
const verticalSize = computed(() => 100 / config.rows);

// 计算属性：方块大小(百分比)
const blockSize = computed(() => 100 / config.cols);

function randomColor() {
  return Math.floor(Math.random() * config.colors) + 1;
}

/**
 * 初始化游戏：创建空网格并只在底部填充随机方块
 */
function initGame() {
  // 创建 config.rows 行、config.cols 列的空网格（全部为 null）
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

/**
 * 处理方块点击事件
 */
 function handleBlockClick(row: number, col: number) {
  if (grid.value[row][col] === null) return;
  if (isAnimating.value || isGameOver.value) return;
  
  const colorId = grid.value[row][col];
  const connectedBlocks = findConnectedBlocks(row, col, colorId as number);
  
  // 修改判断条件，允许消除单个方块
  if (connectedBlocks.length >= 1) {
    isAnimating.value = true;
    removeBlocks(connectedBlocks);
    const points = Math.pow(connectedBlocks.length, 2) * 10;
    score.value += points;
    
    setTimeout(() => {
      handleBlocksFall();
      moves.value++;
      if (moves.value % config.newRowInterval === 0) {
        addNewRow();
      }
      
      if (isTopRowOccupied()) {
        gameOver();
      } else {
        isAnimating.value = false;
      }
    }, config.fallingSpeed);
  }
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

onMounted(() => {
  initGame();
});
</script>

<template>
  <div class="game-wrapper">    
    <div class="game-info">
      <div class="score">分数: {{ score }}</div>
      <button @click="initGame">重新开始</button>
    </div>
    
  <transition-group
    name="block"
    tag="div"
    class="game-container"
    appear>
      <div 
        v-for="(colorId, index) in grid.flat()" 
        :key="`${Math.floor(index/config.cols)}-${index%config.cols}`"
        v-if="colorId !== null"
        class="block"
        :class="`color-${colorId}`"
        :style="{
          left: `${(index % config.cols) * horizontalSize}%`,
          top: `${Math.floor(index / config.cols) * verticalSize}%`,
          width: `${horizontalSize}%`,
          height: `${horizontalSize}%`
        }"
        @click="handleBlockClick(Math.floor(index / config.cols), index % config.cols)"
      ></div>
    
      <div v-if="isGameOver" class="game-over">
        <div class="message">游戏结束!</div>
        <div class="final-score">最终分数: {{ score }}</div>
        <button @click="initGame">再玩一次</button>
      </div>
    </transition-group>
  </div>
</template>

<style>
/* 进入（生成）动画 */
.block-enter-from, .block-appear-from {
  opacity: 0;
  transform: translateY(20%);
}
.block-enter-to, .block-appear-to {
  opacity: 1;
  transform: translateY(0);
}

/* 离开（消除）动画：和 enter 对称 */
.block-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.block-leave-to {
  opacity: 0;
  transform: translateY(20%);
}

/* 移动（下落）动画 */
.block-move {
  transition: transform 0.3s ease;
}

/* 统一过渡时长 */
.block-enter-active,
.block-appear-active,
.block-leave-active {
  transition: all 0.3s ease;
}
</style>

<!-- 2. 组件私有样式 -->
<style scoped>
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