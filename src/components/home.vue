<script setup lang="ts">
import { ref } from 'vue'
const showRules = ref(false)
const openRules = () => showRules.value = true
const closeRules = () => showRules.value = false
</script>

<template>
  <main class="home-page">
    <div class="container">
      <h1>疯狂的方块：粽子大战</h1>
      <router-link to="/game">
        <button class="btn primary">开始游戏</button>
      </router-link>
      <router-link to="/rankboard">
        <button class="btn">排行榜</button>
      </router-link>
      <button class="btn" @click="openRules">规则介绍</button>
    </div>

    <!-- 规则弹窗 -->
    <div v-if="showRules" class="modal-overlay" @click.self="closeRules">
      <div class="modal">
        <h2>游戏规则</h2>
        <ul class="rules-list">
          <p>1. 点击方块，相邻相同的方块即可消除<br>
            2. 每消除一次会新增一行<br>
            3. 方块超出顶部时游戏结束</p>
          <li>
            <img src="../assets/image/no-new-row.jpg" class="rule-icon" alt="跳过新增">
            可使用“五彩绳”道具避免新增一行
          </li>
          <li>
            <img src="../assets/image/row-clear.jpg" class="rule-icon" alt="整行清除">
            可使用“龙舟”道具清空一整行
          </li>
          <li>
            <img src="../assets/image/area-clear.jpg" class="rule-icon" alt="3×3 消除">
            “炸弹”道具可清除选中方块周围的 3×3 区域
          </li>
        </ul>
        <button class="btn" @click="closeRules">我知道了</button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.home-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.container {
  display: flex;
  text-align: center;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background: #ffffff80;
  backdrop-filter: blur(10px);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

h1 {
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 2rem;
}

.btn {
  width: 50vw;
  margin: 0.5rem;
  padding: 0.75rem 1.5rem;
  align-content: center;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  background: #ffffff90;
  color: #333;
  cursor: pointer;
  transition: background 0.3s;
}

.btn.primary {
  background: #ffffff90;
  color: #000000;
}

.btn:hover {
  background: #bbb;
}

.btn.primary:hover {
  background: #45a049;
}

.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: #fff;
  padding: 1.5rem;
  border-radius: 6px;
  max-width: 90%;
  width: 360px;
  text-align: center;
}

.modal h2 {
  margin-bottom: 1rem;
}

.modal p {
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.rules-list {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
  text-align: left;
}

.rules-list li, p {
  display: flex;
  align-items: center;
  margin-bottom: 0.8rem;
  font-size: 1.2rem;
}

.rule-icon {
  width: 50px;
  height: 50px;
  object-fit: cover;
  margin-right: 8px;
  flex-shrink: 0;
}
</style>