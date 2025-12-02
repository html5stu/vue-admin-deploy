<template>
  <div class="p-6 animate-fade-in">
    <!-- 顶部搜索与操作栏：使用白色背景+柔和阴影 -->
    <div class="bg-white p-5 rounded-xl shadow-sm mb-4">
      <div class="flex justify-between items-center">
        <!-- 左侧搜索表单 -->
        <el-form :inline="true" :model="queryParams" class="!mb-0">
          <el-form-item label="角色名称" class="!mb-0 mr-4">
            <el-input
              v-model="queryParams.roleName"
              placeholder="请输入角色名称"
              clearable
              prefix-icon="Search"
              class="w-56"
            />
          </el-form-item>
          <el-form-item label="状态" class="!mb-0 mr-4">
            <el-select
              v-model="queryParams.status"
              placeholder="全部"
              clearable
              class="w-32"
            >
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item class="!mb-0">
            <el-button type="primary" icon="Search" @click="handleQuery"
              >搜索</el-button
            >
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <!-- 右侧添加按钮 -->
        <div>
          <el-button type="primary" plain icon="Plus" @click="handleAdd"
            >新增角色</el-button
          >
        </div>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="bg-white p-5 rounded-xl shadow-sm min-h-[600px] flex flex-col">
      <el-table
        v-loading="loading"
        :data="roleList"
        style="width: 100%"
        :header-cell-style="{ background: '#f8f9fa', color: '#606266' }"
        stripe
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column
          prop="roleName"
          label="角色名称"
          min-width="120"
          font-weight="bold"
        >
          <template #default="{ row }">
            <span class="font-medium text-slate-700">{{ row.roleName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="roleKey" label="权限字符" min-width="120">
          <template #default="{ row }">
            <el-tag type="info" effect="plain">{{ row.roleKey }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="sort"
          label="显示顺序"
          width="100"
          align="center"
        />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              inline-prompt
              active-text="启"
              inactive-text="停"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="createTime"
          label="创建时间"
          width="180"
          align="center"
        />

        <el-table-column label="操作" width="260" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" icon="Edit" @click="handleEdit(row)"
              >编辑</el-button
            >
            <el-button
              link
              type="success"
              icon="Setting"
              @click="handlePermission(row)"
              >权限</el-button
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
      <div class="mt-auto pt-4 flex justify-end">
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

    <!-- 弹窗：新增/编辑角色 -->
    <el-dialog
      :title="dialog.title"
      v-model="dialog.visible"
      width="500px"
      append-to-body
      destroy-on-close
    >
      <el-form
        ref="roleFormRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="form.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="权限字符" prop="roleKey">
          <el-input v-model="form.roleKey" placeholder="例如：admin" />
          <div class="text-xs text-gray-400 mt-1">
            控制器中定义的权限字符，如：@PreAuthorize("hasRole('admin')")
          </div>
        </el-form-item>
        <el-form-item label="显示顺序" prop="sort">
          <el-input-number
            v-model="form.sort"
            :min="0"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="form.remark"
            type="textarea"
            placeholder="请输入备注内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialog.visible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 抽屉：权限分配 (Menu Tree) -->
    <el-drawer
      v-model="permissionDrawer.visible"
      title="分配菜单权限"
      size="400px"
      append-to-body
    >
      <div class="h-full flex flex-col">
        <div class="mb-4 p-3 bg-blue-50 text-blue-600 rounded-lg text-sm">
          正在为角色 <strong>{{ permissionDrawer.roleName }}</strong> 分配权限
        </div>

        <div class="flex-1 overflow-auto border rounded-lg p-2">
          <el-tree
            ref="menuTreeRef"
            :data="menuOptions"
            show-checkbox
            node-key="id"
            :props="{ label: 'label', children: 'children' }"
            default-expand-all
          />
        </div>

        <div class="mt-4 flex justify-end gap-3">
          <el-button @click="permissionDrawer.visible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="permissionDrawer.loading"
            @click="submitPermission"
            >保存权限</el-button
          >
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'Role' })

import { reactive, ref, nextTick, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import {
  getRoleList,
  getRoleMenuTreeselect,
  updateRolePermission,
  createRole,
  updateRole,
  deleteRole,
  updateRoleStatus,
} from '@/api/role'
import { getMenuTreeSelect } from '@/api/menu' // 引入新API

// --- 类型定义 (通常放在 types 目录) ---
interface Role {
  id: number
  roleName: string
  roleKey: string
  sort: number
  status: number
  createTime: string
  remark?: string
}

interface MenuNode {
  id: number
  label: string
  children?: MenuNode[]
}

// --- 状态管理 ---
const loading = ref(false)
const total = ref(0)
const roleFormRef = ref<FormInstance>()
const menuTreeRef = ref()

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  roleName: '',
  status: undefined as number | undefined,
})

// 表格数据 (Mock)
const roleList = ref<Role[]>([])

// 弹窗控制
const dialog = reactive({
  visible: false,
  title: '',
})

// 权限抽屉控制
const permissionDrawer = reactive({
  visible: false,
  loading: false,
  roleId: 0,
  roleName: '',
})

// 表单数据
const form = reactive<Omit<Role, 'createTime'>>({
  id: 0,
  roleName: '',
  roleKey: '',
  sort: 0,
  status: 1,
  remark: '',
})

// 表单校验规则
const rules = {
  roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  roleKey: [{ required: true, message: '请输入权限字符', trigger: 'blur' }],
}

// 菜单树Mock数据
const menuOptions = ref<MenuNode[]>([])

// --- 方法实现 ---

// 获取角色列表
const getList = () => {
  loading.value = true
  getRoleList(queryParams)
    .then((res) => {
      roleList.value = res.data.list
      total.value = res.data.total
    })
    .catch((err) => {
      ElMessage.error('获取角色列表失败')
      console.error(err)
    })
    .finally(() => {
      loading.value = false
    })
}

const handleQuery = () => getList()

const resetQuery = () => {
  queryParams.roleName = ''
  queryParams.status = undefined
  handleQuery()
}

// 重置表单
const resetForm = () => {
  form.id = 0
  form.roleName = ''
  form.roleKey = ''
  form.sort = 0
  form.status = 1
  form.remark = ''
  if (roleFormRef.value) roleFormRef.value.resetFields()
}

// 新增
const handleAdd = () => {
  resetForm()
  dialog.title = '新增角色'
  dialog.visible = true
}

// 编辑
const handleEdit = (row: Role) => {
  resetForm()
  // 这里应该调用详情接口，这里简单深拷贝
  Object.assign(form, JSON.parse(JSON.stringify(row)))
  dialog.title = '编辑角色'
  dialog.visible = true
}

// 提交表单
const submitForm = async () => {
  if (!roleFormRef.value) return

  try {
    await roleFormRef.value.validate()

    // 判断是新增还是编辑（假设通过 form.id 是否存在来判断）
    const request = form.id ? updateRole(form) : createRole(form)

    await request
    ElMessage.success(form.id ? '修改成功' : '新增成功')
    dialog.visible = false
    getList()
  } catch (error) {
    console.error('表单验证失败或提交失败:', error)
  }
}

// 状态切换
const handleStatusChange = (row: Role) => {
  console.log('row', row.status)
  const text = row.status === 1 ? '启用' : '停用'
  ElMessageBox.confirm(`确认要${text} "${row.roleName}" 角色吗?`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      updateRoleStatus({
        id: row.id,
        status: row.status,
      })
        .then(() => {
          ElMessage.success(`${text}成功`)
          getList()
        })
        .catch((err) => {
          row.status = row.status === 1 ? 0 : 1 // 恢复开关状态
        })
    })
    .catch(() => {
      row.status = row.status === 1 ? 0 : 1 // 恢复开关状态
    })
}

// 删除
const handleDelete = (row: Role) => {
  ElMessageBox.confirm(`是否确认删除角色 "${row.roleName}"?`, '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    deleteRole(row.id)
      .then(() => {
        ElMessage.success('删除成功')
        getList()
      })
      .catch((err) => {
        console.error(err)
      })
    getList()
  })
}
// 辅助函数：把树形数据拍扁，提取出所有的 ID
const extractIdsFromTree = (treeData: any[]) => {
  let ids: number[] = []
  treeData.forEach((node) => {
    ids.push(node.id)
    if (node.children && node.children.length > 0) {
      ids = ids.concat(extractIdsFromTree(node.children))
    }
  })
  return ids
}

// 权限分配
const handlePermission = async (row: any) => {
  permissionDrawer.roleId = row.id
  permissionDrawer.roleName = row.roleName
  permissionDrawer.visible = true
  permissionDrawer.loading = true

  try {
    const [menuRes, roleMenuRes] = await Promise.all([
      getMenuTreeSelect(), // 获取完整的菜单树 (用于展示)
      getRoleMenuTreeselect(row.id), // 获取角色拥有的菜单树 (用于回显)
    ])

    menuOptions.value = menuRes.data

    // --- 核心修改开始 ---

    // 1. 后端现在返回的是 Tree 结构，我们先把它拍扁成 ID 数组
    // 比如：[{id:1, children:[{id:2}]}]  --->  [1, 2]
    const roleOwnedIds = extractIdsFromTree(roleMenuRes.data)

    console.log('后端返回的树:', roleMenuRes.data) // 你可以在控制台看到嵌套结构
    console.log('拍扁后的ID:', roleOwnedIds)

    // 2. 依然使用 getLeafKeys 过滤掉父节点，只保留叶子节点ID，防止el-tree全选Bug
    const leafKeys = getLeafKeys(menuOptions.value, roleOwnedIds)

    console.log('叶子节点leafKeys:', leafKeys)

    nextTick(() => {
      menuTreeRef.value.setCheckedKeys(leafKeys)
      permissionDrawer.loading = false
    })

    // --- 核心修改结束 ---
  } catch (error) {
    console.error(error)
    permissionDrawer.loading = false
  }
}

// 辅助函数：遍历树，筛选出存在于 checkedKeys 中的叶子节点
const getLeafKeys = (nodes: any[], checkedKeys: number[]) => {
  console.log('nodes', nodes)

  console.log('checkedKeys', checkedKeys)
  let res: number[] = []
  nodes.forEach((node) => {
    if (node.children && node.children.length > 0) {
      console.log('有子节点', node.id)
      // 如果有子节点，递归去找
      res.push(...getLeafKeys(node.children, checkedKeys))
    } else {
      // 如果是叶子节点，且在后端返回的列表中，则加入
      if (checkedKeys.includes(node.id)) {
        console.log('是叶子结点', node.id)

        res.push(node.id)
      }
    }
  })
  return res
}

const submitPermission = async () => {
  permissionDrawer.loading = true
  try {
    // 1. 获取全选的节点
    const checkedKeys = menuTreeRef.value.getCheckedKeys()
    // 2. 获取半选的节点 (父节点) -> 这个很重要！
    // 比如你勾选了“用户管理”，那么“系统管理”这个父节点也是必须存入数据库的，否则菜单渲染不出来
    const halfCheckedKeys = menuTreeRef.value.getHalfCheckedKeys()

    // 合并 ID
    const finalMenuIds = [...checkedKeys, ...halfCheckedKeys]

    // 3. 发送给后端
    await updateRolePermission({
      roleId: permissionDrawer.roleId,
      menuIds: finalMenuIds,
    })

    ElMessage.success('权限分配成功')
    permissionDrawer.visible = false

    // 可选：如果是修改自己的权限，可能需要提示刷新页面
  } catch (error) {
    console.error(error)
  } finally {
    permissionDrawer.loading = false
  }
}

// 初始化
onMounted(() => {
  getList()
})
</script>

<style scoped>
/* 简单的淡入动画 */
.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
