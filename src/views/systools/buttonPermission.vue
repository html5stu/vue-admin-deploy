<template>
  <div>
    <code>
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
    </code>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss"></style>
