<template>
  <div class="upload-container">
    <el-card title="图片上传示例">
      <!-- 单图上传 -->
      <el-upload
        class="upload-single"
        :headers="headers"
        action="http://localhost:3000/my/article/upload"
        :show-file-list="true"
        :on-success="handleSingleSuccess"
        :on-error="handleError"
        :before-upload="beforeUpload"
        :limit="1"
        :on-exceed="handleExceed"
        name="file"
      >
        <el-button type="primary">点击上传单张图片</el-button>
        <template #tip>
          <div class="el-upload__tip">
            支持上传 JPG、JPEG、PNG、GIF 格式，大小不超过 5MB
          </div>
        </template>
      </el-upload>

      <!-- 单图上传预览 -->
      <div v-if="singleImageUrl" class="image-preview">
        <h4>上传成功预览：</h4>
        <el-image
          :src="singleImageUrl"
          :preview-src-list="[singleImageUrl]"
          fit="contain"
        ></el-image>
        <el-button
          type="danger"
          size="small"
          @click="singleImageUrl = ''"
          class="delete-btn"
        >
          删除
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const headers = {
  Authorization: `${localStorage.getItem('token')}`,
}
// 单图上传相关
const singleImageUrl = ref('')

// 多图上传相关
const multipleImageUrls = ref([])

// 处理单图上传成功
const handleSingleSuccess = (response) => {
  console.log('上传,', response)
  if (response.success) {
    singleImageUrl.value = response.data.url
    ElMessage.success(response.message)
  } else {
    ElMessage.error(response.message)
  }
}

// 处理多图上传成功
const handleMultipleSuccess = (response) => {
  if (response.success) {
    // 将新上传的图片添加到预览列表
    response.data.forEach((img) => {
      multipleImageUrls.value.push(img.url)
    })
    ElMessage.success(response.message)
  } else {
    ElMessage.error(response.message)
  }
}

// 处理上传错误
const handleError = (error) => {
  // 处理不同类型的错误信息
  let errorMsg = '上传失败，请重试'
  if (error.response && error.response.data && error.response.data.message) {
    errorMsg = error.response.data.message
  } else if (error.message) {
    errorMsg = error.message
  }
  ElMessage.error(errorMsg)
}

// 上传前校验
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }

  return true
}

// 处理文件超出限制
const handleExceed = (files, fileList) => {
  ElMessage.warning(
    `当前限制选择 5 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`
  )
}

// 移除图片
const removeImage = (index) => {
  multipleImageUrls.value.splice(index, 1)
  ElMessage.success('图片已移除')
}
</script>

<style scoped>
.upload-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 0 20px;
}

.upload-single,
.upload-multiple {
  margin-bottom: 20px;
}

.image-preview,
.images-preview {
  margin-top: 20px;
  padding: 15px;
  border: 1px dashed #ccc;
  border-radius: 4px;
}

.images-preview .image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 10px;
}

.image-item {
  position: relative;
}

.el-image {
  width: 100%;
  height: 150px;
  object-fit: contain;
}

.delete-btn {
  position: absolute;
  bottom: 10px;
  right: 10px;
  opacity: 0.8;
}

.delete-btn:hover {
  opacity: 1;
}
</style>
