<template>
  <div>
    <div v-hasPermi="['systools:interface:query']">
      <el-button type="primary"
        >有查询权限才能看到我:systools:interface:query</el-button
      >
    </div>
    <div v-hasPermi="['systools:interface:add']">
      <el-button type="success"
        >有新增权限才能看到我:systools:interface:add</el-button
      >
    </div>
    <div v-hasPermi="['systools:interface:edit']">
      <el-button type="warning"
        >有修改权限才能看到我:systools:interface:edit</el-button
      >
    </div>
    <div v-hasPermi="['systools:interface:remove']">
      <el-button type="danger"
        >有删除权限才能看到我:systools:interface:remove</el-button
      >
    </div>

    <el-table :data="tableData">
      <el-table-column prop="src" label="音频地址" width="400">
        <template #default="scope">
          <audio :src="scope.row.src" controls :key="scope.row.id"></audio>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

const tableData = ref([
  {
    src: 'https://oss.bunnyzz.com/book/audio/10114/1.mp3',
    id: 1,
  },
  {
    src: 'https://oss.bunnyzz.com/book/audio/10001/1.mp3',
    id: 2,
  },
])
</script>
