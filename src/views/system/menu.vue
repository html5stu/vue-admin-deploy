<template>
  <div class="p-6">
    <!-- 搜索栏 -->
    <div class="bg-white p-4 rounded-lg shadow-sm mb-4">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="菜单名称">
          <el-input
            v-model="queryParams.menuName"
            placeholder="请输入菜单名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery"
            >搜索</el-button
          >
          <el-button type="primary" plain icon="Plus" @click="handleAdd()"
            >新增</el-button
          >
        </el-form-item>
      </el-form>
    </div>
    <!-- 树形表格 -->
    <div class="bg-white p-4 rounded-lg shadow-sm">
      <el-table
        v-loading="loading"
        :data="menuList"
        row-key="id"
        border
        :tree-props="{ children: 'children' }"
      >
        <el-table-column
          prop="menu_name"
          label="菜单名称"
          :show-overflow-tooltip="true"
          width="160"
        />
        <el-table-column prop="icon" label="图标" align="center" width="60">
          <template #default="{ row }">
            <el-icon v-if="row.icon">
              <component :is="row.icon" />
            </el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="60" align="center" />
        <el-table-column
          prop="perms"
          label="权限标识"
          :show-overflow-tooltip="true"
        />
        <el-table-column
          prop="component"
          label="组件路径"
          :show-overflow-tooltip="true"
        />
        <el-table-column
          prop="hidden"
          label="显示状态"
          width="80"
          align="center"
        >
          <template #default="{ row }">
            <el-tag v-if="row.hidden === 0" type="success">显示</el-tag>
            <el-tag v-else type="info">隐藏</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          width="200"
          class-name="small-padding fixed-width"
        >
          <template #default="scope">
            <el-button
              link
              type="primary"
              icon="Edit"
              @click="handleUpdate(scope.row)"
              >修改</el-button
            >
            <el-button
              link
              type="primary"
              icon="Plus"
              @click="handleAdd(scope.row)"
              >新增</el-button
            >
            <el-button
              link
              type="danger"
              icon="Delete"
              @click="handleDelete(scope.row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 添加或修改菜单对话框 -->
    <el-dialog
      :title="dialog.title"
      v-model="dialog.visible"
      width="680px"
      append-to-body
    >
      <el-form
        ref="menuFormRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="上级菜单">
          <el-tree-select
            v-model="form.parentId"
            :data="menuOptions"
            :props="{ value: 'id', label: 'label', children: 'children' }"
            value-key="id"
            placeholder="选择上级菜单"
            check-strictly
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="菜单类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio value="M">目录</el-radio>
            <el-radio value="C">菜单</el-radio>
            <el-radio value="F">按钮</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="菜单图标" v-if="form.type !== 'F'">
          <!-- 这里简单用输入框代替，实际可用 IconSelect 组件 -->
          <el-input
            v-model="form.icon"
            placeholder="请输入图标名称 (如 user)"
          />
        </el-form-item>

        <el-row>
          <el-col :span="12">
            <el-form-item label="菜单名称" prop="menuName">
              <el-input v-model="form.menuName" placeholder="请输入菜单名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="sort">
              <el-input-number
                v-model="form.sort"
                controls-position="right"
                :min="0"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12" v-if="form.type !== 'F'">
            <el-form-item label="路由地址" prop="path">
              <el-input v-model="form.path" placeholder="请输入路由地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.type === 'C'">
            <el-form-item label="组件路径" prop="component">
              <el-input
                v-model="form.component"
                placeholder="views下的路径 (如 system/user/index)"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="权限字符" v-if="form.type !== 'M'">
          <el-input
            v-model="form.perms"
            placeholder="controller中定义的权限字符，如：system:user:list"
          />
        </el-form-item>

        <el-row v-if="form.type !== 'F'">
          <el-col :span="12">
            <el-form-item label="显示状态">
              <el-radio-group v-model="form.hidden">
                <el-radio :value="0">显示</el-radio>
                <el-radio :value="1">隐藏</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.type === 'C'">
            <el-form-item label="是否缓存">
              <el-radio-group v-model="form.noCache">
                <el-radio :value="0">缓存</el-radio>
                <el-radio :value="1">不缓存</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialog.visible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'Menu',
})
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMenuList, getMenu, delMenu, addMenu, updateMenu } from '@/api/menu'

const loading = ref(false)
const menuList = ref([])
const menuOptions = ref([]) // 上级菜单下拉树数据
const menuFormRef = ref()

const queryParams = reactive({
  menuName: undefined,
  status: undefined,
})

const dialog = reactive({
  title: '',
  visible: false,
})

const form = reactive({
  id: undefined,
  parentId: 0,
  menuName: '',
  icon: '',
  type: 'M',
  sort: 0,
  path: '',
  component: '',
  perms: '',
  hidden: 0,
  noCache: 0,
})

// 自定义校验器：顶级菜单组件必须是 Layout
const validateComponent = (rule: any, value: string, callback: any) => {
  if (form.type === 'C' && !value) {
    callback(new Error('菜单组件路径不能为空'))
  } else {
    callback()
  }
}

const rules = {
  menuName: [{ required: true, message: '菜单名称不能为空', trigger: 'blur' }],
  sort: [{ required: true, message: '菜单顺序不能为空', trigger: 'blur' }],
  path: [{ required: true, message: '路由地址不能为空', trigger: 'blur' }],
  component: [{ validator: validateComponent, trigger: 'blur' }],
}

// --- 方法 ---

// 1. 获取列表
const getList = async () => {
  loading.value = true
  try {
    const res: any = await getMenuList(queryParams)
    menuList.value = res.data
  } finally {
    loading.value = false
  }
}
// 2. 获取上级菜单树 (用于下拉选择)
// 我们需要给树加一个根节点 "主类目"，方便选择顶级菜单
const getTreeselect = async () => {
  const res: any = await getMenuList({}) // 复用 list 接口拿树
  const menu: any = { id: 0, label: '主类目', children: [] }
  menu.children = res.data.map((node: any) => mapTreeSelect(node))
  menuOptions.value = [menu]
}

// 辅助映射：后端返回的是 menu_name，el-tree-select 需要 label
const mapTreeSelect = (node: any) => {
  return {
    id: node.id,
    label: node.menu_name,
    children: node.children ? node.children.map(mapTreeSelect) : undefined,
  }
}
const handleQuery = () => getList()

// 修改菜单
const handleUpdate = async (row: any) => {
  resetForm()
  await getTreeselect()
  const res: any = await getMenu(row.id)
  const { parent_id, menu_name, no_cache, ...otherFields } = res.data

  console.log('菜单详情', res)

  // 重置表单
  Object.keys(form).forEach((key) => {
    form[key] = undefined
  })
  // 更新表单数据
  Object.assign(form, {
    ...otherFields,
    parentId: parent_id,
    menuName: menu_name,
    noCache: no_cache,
  })
  dialog.title = '修改菜单'
  dialog.visible = true
}

const resetForm = () => {
  Object.assign(form, {
    id: undefined,
    parentId: 0,
    menuName: '',
    icon: '',
    type: 'M',
    sort: 0,
    path: '',
    component: '',
    perms: '',
    hidden: 0,
    noCache: 0,
  })
  menuFormRef.value?.resetFields()
}

// 新增
const handleAdd = (row?: any) => {
  resetForm()
  getTreeselect()
  if (row != null && row.id) {
    form.parentId = row.id // 如果是从行点击新增，自动填入父ID
  } else {
    form.parentId = 0
  }
  dialog.title = '添加菜单'
  dialog.visible = true
}

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `是否确认删除名称为"${row.menu_name}"的数据项?`,
    '警告',
    {
      type: 'warning',
    }
  ).then(async () => {
    await delMenu(row.id)
    ElMessage.success('删除成功')
    getList()
  })
}

onMounted(() => {
  getList()
})

// 提交
const submitForm = async () => {
  await menuFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      if (form.id) {
        await updateMenu(form)
        ElMessage.success('修改成功')
      } else {
        console.log('form', form)
        await addMenu(form)
        ElMessage.success('新增成功')
      }
      dialog.visible = false
      getList()
    }
  })
}
</script>

<style scoped lang="scss"></style>
