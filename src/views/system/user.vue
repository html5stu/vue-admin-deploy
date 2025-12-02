<template>
  <div class="p-6">
    <!-- 搜索区 -->
    <div class="bg-white p-4 rounded-lg shadow-sm mb-4">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="用户账号">
          <el-input
            v-model="queryParams.username"
            placeholder="请输入账号"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="手机号码">
          <el-input
            v-model="queryParams.phone"
            placeholder="请输入手机号"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery"
            >搜索</el-button
          >
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      <div class="mb-0">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          >新增用户</el-button
        >
      </div>
    </div>

    <!-- 表格区 -->
    <div class="bg-white p-4 rounded-lg shadow-sm">
      <el-table v-loading="loading" :data="userList" border style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="username" label="用户账号" min-width="120" />
        <el-table-column prop="nickname" label="昵称" min-width="120" />

        <!-- 这里现在可以直接读取 role_name 字段了 -->
        <el-table-column prop="roleName" label="角色" min-width="120">
          <template #default="{ row }">
            <el-tag v-if="row.roleName" type="success">{{
              row.roleName
            }}</el-tag>
            <el-tag v-else type="info">暂无角色</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="phone" label="手机号码" width="120" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" icon="Edit" @click="handleEdit(row)"
              >编辑</el-button
            >
            <el-button
              link
              type="danger"
              icon="Delete"
              @click="handleDelete(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleQuery"
          @current-change="handleQuery"
        />
      </div>
    </div>

    <!-- 弹窗 -->
    <el-dialog
      :title="dialog.title"
      v-model="dialog.visible"
      width="500px"
      append-to-body
    >
      <el-form
        ref="userFormRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="用户账号" prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入账号"
            :disabled="!!form.id"
          />
        </el-form-item>
        <el-form-item label="用户密码" prop="password" v-if="!form.id">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            placeholder="请输入密码"
          />
        </el-form-item>
        <el-form-item label="用户昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="关联角色" prop="roleId">
          <el-select
            v-model="form.roleId"
            placeholder="请选择角色"
            class="w-full"
          >
            <el-option
              v-for="item in roleOptions"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="form.phone" maxlength="11" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">正常</el-radio>
            <el-radio :value="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// --- 引用 API ---
import {
  getUserList,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
} from '@/api/user'
import { getRoleList } from '@/api/role'

// --- 数据定义 ---
const loading = ref(false)
const total = ref(0)
const userList = ref([])
const roleOptions = ref<any[]>([]) // 角色下拉数据
const userFormRef = ref()

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  username: '',
  phone: '',
  status: undefined,
})

const dialog = reactive({ visible: false, title: '' })

const form = reactive({
  id: undefined,
  username: '',
  password: '',
  nickname: '',
  roleId: undefined,
  phone: '',
  status: 1,
  remark: '',
})

const rules = {
  username: [{ required: true, message: '必填', trigger: 'blur' }],
  password: [
    { required: true, message: '必填', trigger: 'blur' },
    { min: 6, message: '至少6位', trigger: 'blur' },
  ],
  nickname: [{ required: true, message: '必填', trigger: 'blur' }],
}

// --- 逻辑方法 ---

const formatTime = (str: string) => (str ? new Date(str).toLocaleString() : '')

// 获取用户列表
const getList = async () => {
  loading.value = true
  try {
    const res: any = await getUserList(queryParams)
    userList.value = res.data.list
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

// 获取角色下拉框 (复用 Role API)
const getRoleOptions = async () => {
  const res: any = await getRoleList({ pageNum: 1, pageSize: 100, status: 1 })
  roleOptions.value = res.data.list
}

const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

const resetQuery = () => {
  queryParams.username = ''
  queryParams.phone = ''
  handleQuery()
}

const handleAdd = () => {
  dialog.title = '新增用户'
  dialog.visible = true
  Object.assign(form, {
    id: undefined,
    username: '',
    password: '',
    nickname: '',
    roleId: undefined,
    phone: '',
    status: 1,
    remark: '',
  })
  setTimeout(() => userFormRef.value?.clearValidate(), 0)
}

const handleEdit = (row: any) => {
  dialog.title = '编辑用户'
  dialog.visible = true
  Object.assign(form, JSON.parse(JSON.stringify(row)))
  form.password = ''
}

// 提交表单
const submitForm = async () => {
  await userFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      if (form.id) {
        await updateUser(form) // 调用 API
        ElMessage.success('修改成功')
      } else {
        await createUser(form) // 调用 API
        ElMessage.success('新增成功')
      }
      dialog.visible = false
      getList()
    }
  })
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确认删除用户 "${row.username}"?`, '警告', {
    type: 'warning',
  }).then(async () => {
    await deleteUser(row.id) // 调用 API
    ElMessage.success('删除成功')
    getList()
  })
}

const handleStatusChange = async (row: any) => {
  try {
    await updateUserStatus({ id: row.id, status: row.status }) // 调用 API
    ElMessage.success('状态更新成功')
  } catch {
    row.status = row.status === 1 ? 0 : 1
  }
}

onMounted(() => {
  getList()
  getRoleOptions()
})
</script>
