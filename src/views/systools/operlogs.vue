<template>
  <div class="p-6">
    <!-- 搜索栏 -->
    <div class="bg-white p-4 rounded-lg shadow-sm mb-4">
      <el-form :model="queryParams" ref="queryRef" :inline="true">
        <el-form-item label="系统模块" prop="title">
          <el-input
            v-model="queryParams.title"
            placeholder="请输入模块标题"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="操作人员" prop="operName">
          <el-input
            v-model="queryParams.operName"
            placeholder="请输入操作人员"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select
            v-model="queryParams.status"
            placeholder="操作状态"
            clearable
            style="width: 120px"
          >
            <el-option label="正常" :value="0" />
            <el-option label="异常" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery"
            >搜索</el-button
          >
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 工具栏 -->
      <div class="mb-0">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="ids.length === 0"
          @click="handleDelete"
        >
          删除
        </el-button>
        <el-button type="danger" icon="Delete" @click="handleClean">
          清空
        </el-button>
      </div>
    </div>

    <!-- 表格 -->
    <div class="bg-white p-4 rounded-lg shadow-sm">
      <el-table
        v-loading="loading"
        :data="operLogList"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column
          label="日志编号"
          align="center"
          prop="oper_id"
          width="80"
        />
        <el-table-column label="系统模块" align="center" prop="title" />
        <el-table-column label="业务类型" align="center" prop="business_type">
          <template #default="scope">
            <el-tag :type="getBusinessType(scope.row.business_type).type">
              {{ getBusinessType(scope.row.business_type).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="请求方式"
          align="center"
          prop="request_method"
        />
        <el-table-column label="操作人员" align="center" prop="oper_name" />
        <el-table-column
          label="操作IP"
          align="center"
          prop="oper_ip"
          width="130"
        />
        <el-table-column label="操作状态" align="center" prop="status">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 0" type="success">成功</el-tag>
            <el-tag v-else type="danger">失败</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作日期"
          align="center"
          prop="oper_time"
          width="180"
        >
          <template #default="scope">
            {{ formatTime(scope.row.oper_time) }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          class-name="small-padding fixed-width"
        >
          <template #default="scope">
            <el-button
              link
              type="primary"
              icon="View"
              @click="handleView(scope.row)"
              >详细</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleQuery"
          @current-change="handleQuery"
        />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog title="操作日志详情" v-model="open" width="700px" append-to-body>
      <el-form :model="form" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="操作模块：">{{ form.title }}</el-form-item>
            <el-form-item label="登录信息："
              >{{ form.oper_name }} / {{ form.oper_ip }}</el-form-item
            >
          </el-col>
          <el-col :span="12">
            <el-form-item label="请求地址：">{{ form.oper_url }}</el-form-item>
            <el-form-item label="请求方式：">{{
              form.request_method
            }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="操作方法：">{{ form.method }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="请求参数：">
              <div class="code-box">{{ form.oper_param }}</div>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="返回参数：">
              <div class="code-box">{{ form.json_result }}</div>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="状态：">
              <div v-if="form.status === 0">正常</div>
              <div v-else :style="{ color: 'red' }">失败</div>
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="form.status === 1">
            <el-form-item label="异常信息：">{{ form.error_msg }}</el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="open = false">关 闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'OperLogs',
})
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listOperLog } from '@/api/operlog.js'

// 数据
const loading = ref(true)
const ids = ref<number[]>([]) // 选中的ID数组
const total = ref(0)
const operLogList = ref([])
const open = ref(false)
const form = ref<any>({})

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  title: undefined,
  operName: undefined,
  status: undefined,
})

// 业务类型字典
const businessTypeMap: any = {
  0: { label: '其他', type: 'info' },
  1: { label: '新增', type: '' }, // primary
  2: { label: '修改', type: 'warning' },
  3: { label: '删除', type: 'danger' },
  4: { label: '授权', type: 'success' },
  5: { label: '导出', type: 'warning' },
  6: { label: '导入', type: 'warning' },
}

// --- 方法 ---

const getBusinessType = (type: number) => {
  return businessTypeMap[type] || { label: '未知', type: 'info' }
}

const formatTime = (time: string) => {
  if (!time) return ''
  return new Date(time).toLocaleString()
}

const getList = async () => {
  loading.value = true
  try {
    const res: any = await listOperLog(queryParams)
    operLogList.value = res.data.list
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

const resetQuery = () => {
  queryParams.title = undefined
  queryParams.operName = undefined
  queryParams.status = undefined
  handleQuery()
}

// 多选框选中数据
const handleSelectionChange = (selection: any[]) => {
  ids.value = selection.map((item) => item.oper_id)
}

// 查看详情
const handleView = (row: any) => {
  open.value = true
  form.value = row
}

// 删除
const handleDelete = () => {
  const operIds = ids.value.join(',')
  ElMessageBox.confirm('是否确认删除选中的日志数据项?', '警告', {
    type: 'warning',
  }).then(async () => {
    await delOperLog(operIds)
    ElMessage.success('删除成功')
    getList()
    ids.value = [] // 清空选中
  })
}

// 清空
const handleClean = () => {
  ElMessageBox.confirm('是否确认清空所有操作日志数据项?', '警告', {
    type: 'warning',
  }).then(async () => {
    await cleanOperLog()
    ElMessage.success('清空成功')
    getList()
  })
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.code-box {
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 10px;
  width: 100%;
  max-height: 200px;
  overflow: auto;
  word-break: break-all;
  font-family: monospace;
}
</style>
