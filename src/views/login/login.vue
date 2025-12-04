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
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            type="password"
            show-password
          />
        </el-form-item>

        <!-- 新增：验证码区域 -->
        <el-form-item prop="code">
          <div class="flex w-full gap-2">
            <el-input
              v-model="loginForm.code"
              placeholder="验证码"
              prefix-icon="Key"
              class="flex-1"
              @keyup.enter="handleLogin"
            />
            <!-- 验证码图片容器 -->
            <div
              class="captcha-box cursor-pointer"
              v-html="captchaSvg"
              @click="refreshCaptcha"
              title="点击刷新"
            ></div>
          </div>
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
import { reactive, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'
import { getCaptcha } from '@/api/auth' // 引入API

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loginFormRef = ref()
const loading = ref(false)
const captchaSvg = ref('')
const loginForm = reactive({
  username: '',
  password: '',
  code: '', // 验证码输入值
  uuid: '', // 验证码唯一ID
})

// 校验规则
const loginRules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
}
// 获取/刷新验证码
const refreshCaptcha = async () => {
  try {
    const res: any = await getCaptcha()
    // res.data 包含 { uuid, img }
    loginForm.uuid = res.data.uuid
    captchaSvg.value = res.data.img
    loginForm.code = '' // 刷新后清空输入框
  } catch (error) {
    console.error(error)
  }
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
// 初始化时获取验证码
onMounted(() => {
  refreshCaptcha()
})
</script>
<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
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

/* 验证码图片样式 */
.captcha-box {
  width: 120px;
  height: 40px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}

/* 深度选择器：控制 SVG 尺寸适应容器 */
:deep(.captcha-box svg) {
  width: 100%;
  height: 100%;
}
</style>
