<template>
  <div class="chat-room">
    <h1>简易聊天室</h1>

    <!-- 消息列表 -->
    <div class="message-list">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        class="message-item"
        :class="{ self: msg.isSelf }"
      >
        <div class="sender">{{ msg.isSelf ? '我' : '对方' }}</div>
        <div class="content">{{ msg.content }}</div>
        <div class="time">{{ formatTime(msg.time) }}</div>
      </div>
    </div>

    <!-- 消息输入区域 -->
    <div class="input-area">
      <input
        type="text"
        v-model="inputMessage"
        placeholder="输入消息..."
        @keyup.enter="sendMessage"
      />
      <button @click="sendMessage">发送</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { io } from 'socket.io-client'

// 消息类型定义
interface Message {
  content: string // 消息内容
  time: number // 时间戳
  isSelf: boolean // 是否是自己发送的消息
}

// 状态定义
const inputMessage = ref('') // 输入框内容
const messages = ref<Message[]>([]) // 消息列表
const socket = io('http://localhost:3001') // 连接后端Socket服务

// 格式化时间（例如：14:30:25）
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toTimeString().slice(0, 8)
}

// 发送消息
const sendMessage = () => {
  if (!inputMessage.value.trim()) return // 空消息不发送

  // 构造消息对象
  const newMessage: Message = {
    content: inputMessage.value.trim(),
    time: Date.now(),
    isSelf: true, // 自己发送的消息
  }

  // 1. 发送给后端（广播给所有用户） 1. 发送消息给后端时，用 'clientSend' 事件名
  socket.emit('clientSend', newMessage)

  // 2. 添加到本地消息列表（避免等待后端广播的延迟）
  messages.value.push(newMessage)

  // 3. 清空输入框
  inputMessage.value = ''

  // 4. 保存到本地缓存
  saveMessagesToLocal()
}

// 从本地缓存加载历史消息
const loadMessagesFromLocal = () => {
  const stored = localStorage.getItem('chatMessages')
  if (stored) {
    messages.value = JSON.parse(stored)
  }
}

// 保存消息到本地缓存
const saveMessagesToLocal = () => {
  localStorage.setItem('chatMessages', JSON.stringify(messages.value))
}

// 生命周期：组件挂载时执行
onMounted(() => {
  // 1. 加载本地缓存的历史消息
  loadMessagesFromLocal()

  // 2. 监听后端广播的消息 监听后端广播时，用 'serverBroadcast' 事件名
  socket.on('serverBroadcast', (msg: Message) => {
    console.log('用户接受到消息', msg)
    // 如果是他人发送的消息（自己的消息已经提前添加）
    messages.value.push({ ...msg, isSelf: false })
    saveMessagesToLocal() // 保存到本地
  })
})
</script>

<style scoped lang="scss">
.chat-room {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: sans-serif;

  .message-list {
    height: 500px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 10px;
    margin-bottom: 20px;
    overflow-y: auto; // 消息过多时滚动
  }

  .message-item {
    margin: 10px 0;
    padding: 10px;
    border-radius: 8px;
    max-width: 60%;
    word-break: break-all; // 长文本换行

    &.self {
      // 自己的消息（靠右）
      background: #4cd964;
      margin-left: auto;
    }

    &:not(.self) {
      // 他人的消息（靠左）
      background: #f0f0f0;
    }

    .sender {
      font-size: 12px;
      color: #666;
      margin-bottom: 4px;
    }

    .time {
      font-size: 10px;
      color: #999;
      text-align: right;
      margin-top: 4px;
    }
  }

  .input-area {
    display: flex;
    gap: 10px;

    input {
      flex: 1;
      padding: 10px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      font-size: 16px;
    }

    button {
      padding: 0 20px;
      background: #007aff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;

      &:hover {
        background: #0066cc;
      }
    }
  }
}
</style>
