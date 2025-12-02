<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="title">后台管理系统</h2>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        size="large"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入账号"
            prefix-icon="User"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            type="password"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-button
          type="primary"
          class="w-full mt-4"
          :loading="loading"
          @click="handleLogin"
        >
          登 陆
        </el-button>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loginFormRef = ref()
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
})

// 校验规则
const loginRules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const handleLogin = () => {
  console.log('1. 点击了登录按钮') // Debug 日志

  if (!loginFormRef.value) return

  loginFormRef.value.validate(async (valid: boolean, fields: any) => {
    if (valid) {
      loading.value = true
      try {
        // 调用 Store 的 login action
        await userStore.login(loginForm)

        console.log('3. 登录接口调用成功，Token已保存') // Debug 日志
        ElMessage.success('登录成功')

        // 跳转逻辑
        const redirect = route.query.redirect as string
        const path = redirect || '/'
        router.push(path)
      } catch (error) {
        // 如果 request.js 里没有弹窗，这里可以弹
        console.error('登录失败:', error)
      } finally {
        loading.value = false
      }
    } else {
      console.log('表单校验失败:', fields) // 看看是不是哪里没填对
      return false
    }
  })
}
</script>
<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  /* 简单的渐变背景，你可以换成图片 url('@/assets/login-bg.jpg') */
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 24px;
  font-weight: bold;
  color: #333;
}
</style>
