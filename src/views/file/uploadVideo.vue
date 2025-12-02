<template>
  <div class="video-upload-container">
    <el-card title="视频分片上传" class="upload-card">
      <!-- 上传区域 -->
      <el-upload
        class="upload-area"
        action=""
        :show-file-list="false"
        :before-upload="handleBeforeUpload"
        :on-change="handleFileChange"
        :auto-upload="false"
      >
        <div v-if="!selectedFile" class="upload-placeholder">
          <el-icon class="upload-icon"><UploadFilled /></el-icon>
          <div class="upload-text">点击或拖拽视频文件到此处上传</div>
          <el-text size="small" type="info"
            >支持断点续传，最大支持GB级文件</el-text
          >
        </div>

        <div v-if="selectedFile" class="file-info">
          <!-- 文件信息 -->
          <div class="file-header">
            <el-icon class="file-icon"><VideoFilled /></el-icon>
            <div class="file-meta">
              <el-text strong>{{ selectedFile.name }}</el-text>
              <el-text type="secondary" size="small">{{
                formatFileSize(selectedFile.size)
              }}</el-text>
            </div>
            <el-button
              icon="Delete"
              size="small"
              type="text"
              @click="resetUpload"
              circle
            ></el-button>
          </div>

          <!-- 进度条：仅在上传中/暂停/完成时展示 -->
          <el-progress
            v-if="uploading || uploadPaused || uploadCompleted"
            :percentage="uploadProgress"
            :status="uploadStatus"
            :stroke-width="6"
            class="upload-progress"
          ></el-progress>

          <!-- 进度信息：仅在上传阶段展示 -->
          <div
            v-if="uploading || uploadPaused || uploadCompleted"
            class="progress-info"
          >
            <el-text size="small">
              {{ uploadProgress.toFixed(1) }}%
              <span v-if="uploading"
                >({{ formatFileSize(uploadedSize) }} /
                {{ formatFileSize(totalSize) }})</span
              >
            </el-text>

            <el-text
              size="small"
              :type="uploadStatus === 'success' ? 'success' : 'warning'"
              v-if="uploadStatus === 'success' || uploadStatus === 'warning'"
            >
              {{ statusText }}
            </el-text>
          </div>

          <!-- 哈希计算提示：替代原哈希阶段的进度条 -->
          <el-text
            v-if="
              isComputingHash && !uploading && !uploadPaused && !uploadCompleted
            "
            size="small"
            type="info"
          >
            <el-icon><LoadingFilled /></el-icon>
            正在计算文件哈希，准备上传...
          </el-text>

          <!-- 断点续传提示：未开始上传时展示 -->
          <el-text
            v-if="
              hasUploadedChunks &&
              !uploading &&
              !uploadPaused &&
              !uploadCompleted &&
              !isComputingHash
            "
            size="small"
            type="info"
          >
            发现已上传 {{ uploadedChunks.length }} 个分片，点击「开始上传」继续
          </el-text>
        </div>
      </el-upload>

      <!-- 控制按钮 -->
      <div class="upload-controls">
        <el-button
          @click.stop="startUpload"
          :disabled="
            uploading || uploadCompleted || uploadPaused || isComputingHash
          "
          type="primary"
          size="small"
        >
          <el-icon><PlayFilled /></el-icon>
          开始上传
        </el-button>

        <el-button
          @click="pauseUpload"
          :disabled="!uploading || uploadPaused || uploadCompleted"
          type="warning"
          size="small"
        >
          <el-icon><PauseFilled /></el-icon>
          暂停
        </el-button>

        <el-button
          @click="resumeUpload"
          :disabled="!uploadPaused || uploading || uploadCompleted"
          type="success"
          size="small"
        >
          <el-icon><PlayFilled /></el-icon>
          继续
        </el-button>

        <el-button
          @click="cancelUpload"
          :disabled="
            !uploading &&
            !uploadPaused &&
            !uploadCompleted &&
            !hasUploadedChunks
          "
          type="danger"
          size="small"
        >
          <el-icon><CloseFilled /></el-icon>
          取消
        </el-button>
      </div>

      <!-- 上传成功提示 -->
      <el-alert
        v-if="uploadCompleted"
        title="上传完成"
        :description="`视频已成功上传，URL: ${videoUrl}`"
        type="success"
        show-icon
        class="success-alert"
      ></el-alert>

      <!-- 错误提示 -->
      <el-alert
        v-if="errorMessage"
        :title="errorMessage"
        type="error"
        show-icon
        closable
        @close="errorMessage = ''"
        class="error-alert"
      ></el-alert>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import SparkMD5 from 'spark-md5'
import axios from 'axios'

// 引入Element Plus组件和图标（补充缺失的图标）
import { ElMessage } from 'element-plus'

// 文件相关
const selectedFile = ref(null)
const fileHash = ref('')
const chunks = ref([])
const chunkSize = 5 * 1024 * 1024 // 5MB每片

// 上传状态：新增哈希计算状态标识
const isComputingHash = ref(false) // 是否正在计算文件哈希
const uploadProgress = ref(0) // 仅表示上传阶段的总进度
const uploadedSize = ref(0)
const totalSize = ref(0)
const uploading = ref(false)
const uploadPaused = ref(false)
const uploadCompleted = ref(false)
const errorMessage = ref('')
const videoUrl = ref('')

// 断点续传相关
const uploadedChunks = ref([])
const currentChunkIndex = ref(0)
const abortController = ref(null)

// 计算属性：是否存在已上传分片（用于提示）
const hasUploadedChunks = computed(() => uploadedChunks.value.length > 0)

// 处理上传前的校验
const handleBeforeUpload = (file) => {
  if (!file.type.startsWith('video/')) {
    ElMessage.error('请选择视频文件（支持MP4、MOV等格式）')
    return false
  }
  return true
}

// 处理文件选择
const handleFileChange = (uploadFile) => {
  const file = uploadFile.raw
  resetUpload()
  selectedFile.value = file
  totalSize.value = file.size
  createFileChunks(file)
}

// 创建文件分片
const createFileChunks = (file) => {
  const chunksList = []
  let current = 0

  while (current < file.size) {
    // 处理最后一个分片（避免超出文件大小）
    const end = Math.min(current + chunkSize, file.size)
    chunksList.push({
      file: file.slice(current, end),
      index: chunksList.length,
      size: end - current, // 记录实际分片大小（用于精准计算进度）
    })
    current = end
  }

  chunks.value = chunksList
  computeFileHash(file, chunksList)
}

// 计算文件哈希：新增状态管理，隐藏进度
const computeFileHash = (file, chunksList) => {
  isComputingHash.value = true // 开启哈希计算状态
  const spark = new SparkMD5.ArrayBuffer()
  const fileReader = new FileReader()
  let currentChunk = 0

  const loadNextChunk = () => {
    const chunk = chunksList[currentChunk].file
    fileReader.readAsArrayBuffer(chunk)
  }

  fileReader.onload = (e) => {
    spark.append(e.target.result)
    currentChunk++

    if (currentChunk < chunksList.length) {
      loadNextChunk() // 仅处理分片，不更新进度条
    } else {
      fileHash.value = spark.end()
      isComputingHash.value = false // 关闭哈希计算状态
      // 检查已上传分片（此时不展示进度）
      checkUploadedChunks()
    }
  }

  fileReader.onerror = () => {
    isComputingHash.value = false // 异常时关闭状态
    errorMessage.value = '计算文件哈希失败，请重试'
    console.error('文件哈希计算错误:', fileReader.error)
  }

  loadNextChunk()
}

// 检查已上传的分片
const checkUploadedChunks = async () => {
  if (!fileHash.value || !selectedFile.value) return

  try {
    const response = await axios.post(
      'http://localhost:3009/upload/upload/check-chunks',
      {
        fileHash: fileHash.value,
        fileName: selectedFile.value.name,
      }
    )

    if (response.data.success) {
      // 如果文件已完全上传（直接展示结果）
      if (response.data.fileExists) {
        uploadCompleted.value = true
        uploadProgress.value = 100
        videoUrl.value = response.data.fileUrl
        ElMessage.success('文件已上传完成')
        return
      }

      // 记录已上传的分片（仅更新数据，不展示进度）
      uploadedChunks.value = response.data.uploadedChunks || []
      currentChunkIndex.value =
        uploadedChunks.value.length > 0
          ? Math.max(...uploadedChunks.value) + 1
          : 0

      // 计算已上传大小（用于后续上传时展示）
      uploadedSize.value = uploadedChunks.value.reduce((total, index) => {
        // 找到对应分片的实际大小（避免固定5MB导致的进度误差）
        const chunk = chunks.value.find((c) => c.index === index)
        return total + (chunk ? chunk.size : chunkSize)
      }, 0)

      // 提前计算初始进度（点击开始上传后直接展示）
      uploadProgress.value = totalSize.value
        ? Math.min((uploadedSize.value / totalSize.value) * 100, 100)
        : 0
    }
  } catch (err) {
    errorMessage.value =
      '检查上传进度失败：' + (err.response?.data?.message || err.message)
    console.error('检查上传进度错误:', err)
  }
}

// 开始上传：点击后才初始化进度展示
const startUpload = async () => {
  if (!selectedFile.value || !fileHash.value || uploading.value) return

  uploading.value = true
  uploadPaused.value = false
  errorMessage.value = ''

  await uploadChunks()
}

// 上传分片：优化进度计算逻辑
const uploadChunks = async () => {
  // 终止条件：所有分片上传完成
  if (currentChunkIndex.value >= chunks.value.length) {
    await mergeChunks()
    return
  }

  // 跳过已上传的分片
  if (uploadedChunks.value.includes(currentChunkIndex.value)) {
    currentChunkIndex.value++
    return uploadChunks()
  }

  const chunk = chunks.value[currentChunkIndex.value]
  const formData = new FormData()

  formData.append('fileHash', fileHash.value)
  formData.append('fileName', selectedFile.value.name)
  formData.append('chunkIndex', chunk.index)
  formData.append('chunk', chunk.file)

  abortController.value = new AbortController()

  try {
    const response = await axios.post(
      'http://localhost:3009/upload/upload/upload-chunk',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        signal: abortController.value.signal,
        onUploadProgress: (e) => {
          if (e.lengthComputable && uploading.value) {
            // 精准计算当前上传进度：已上传大小 + 当前分片已传大小
            const chunkUploadedSize = e.loaded
            const currentTotalUploaded = uploadedSize.value + chunkUploadedSize
            uploadProgress.value = Math.min(
              (currentTotalUploaded / totalSize.value) * 100,
              100
            )
          }
        },
      }
    )

    if (response.data.success) {
      // 上传成功后更新已上传大小（用实际分片大小）
      uploadedChunks.value.push(chunk.index)
      uploadedSize.value += chunk.size
      // 更新进度（避免onUploadProgress未触发的情况）
      uploadProgress.value = Math.min(
        (uploadedSize.value / totalSize.value) * 100,
        100
      )
      currentChunkIndex.value++
      uploadChunks()
    } else {
      errorMessage.value = response.data.message || '分片上传失败'
      uploading.value = false
      uploadPaused.value = true
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      errorMessage.value =
        '上传失败：' + (err.response?.data?.message || err.message)
      console.error('分片上传错误:', err)
    }
    uploading.value = false
    uploadPaused.value = true
  }
}

// 暂停上传
const pauseUpload = () => {
  if (abortController.value) {
    abortController.value.abort()
  }
  uploading.value = false
  uploadPaused.value = true
  ElMessage.info('上传已暂停')
}

// 继续上传
const resumeUpload = () => {
  if (currentChunkIndex.value < chunks.value.length) {
    uploading.value = true
    uploadPaused.value = false
    ElMessage.info('继续上传')
    uploadChunks()
  }
}

// 取消上传：优化逻辑（保留已上传分片时不清理）
const cancelUpload = async () => {
  if (abortController.value) {
    abortController.value.abort()
  }

  // 仅当有已上传分片时，才询问是否清理（根据后端保留分片的逻辑）
  if (hasUploadedChunks.value) {
    try {
      await axios.post('http://localhost:3009/upload/upload/cancel-upload', {
        fileHash: fileHash.value,
        deleteChunks: false, // 配合后端保留分片，如需清理可改为true
      })
      ElMessage.success('已取消上传，分片已保留')
    } catch (err) {
      console.error('取消上传错误:', err)
      ElMessage.error('取消上传失败')
    }
  } else {
    ElMessage.success('已取消上传')
  }

  resetUpload()
}

// 合并分片
const mergeChunks = async () => {
  try {
    const response = await axios.post(
      'http://localhost:3009/upload/upload/merge-chunks',
      {
        fileHash: fileHash.value,
        fileName: selectedFile.value.name,
        totalChunks: chunks.value.length,
      }
    )

    if (response.data.success) {
      uploadCompleted.value = true
      uploadProgress.value = 100
      videoUrl.value = response.data.fileUrl
      // 若后端返回分片目录URL，可在此处记录（用于后续展示分片）
      // chunksUrl.value = response.data.chunksUrl
      ElMessage.success('文件上传完成')
    } else {
      errorMessage.value = response.data.message || '文件合并失败'
    }
  } catch (err) {
    errorMessage.value =
      '文件合并失败：' + (err.response?.data?.message || err.message)
    console.error('合并分片错误:', err)
  } finally {
    uploading.value = false
  }
}

// 重置上传状态
const resetUpload = () => {
  selectedFile.value = null
  fileHash.value = ''
  chunks.value = []
  isComputingHash.value = false // 重置哈希计算状态
  uploadProgress.value = 0
  uploadedSize.value = 0
  totalSize.value = 0
  uploading.value = false
  uploadPaused.value = false
  uploadCompleted.value = false
  errorMessage.value = ''
  videoUrl.value = ''
  uploadedChunks.value = []
  currentChunkIndex.value = 0

  if (abortController.value) {
    abortController.value.abort()
    abortController.value = null
  }
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 计算上传状态
const uploadStatus = computed(() => {
  if (uploadCompleted.value) return 'success'
  if (errorMessage.value) return 'exception'
  if (uploadPaused.value) return 'warning'
  return uploading.value ? 'processing' : ''
})

// 状态文本
const statusText = computed(() => {
  if (uploadCompleted.value) return '上传成功'
  if (uploadPaused.value) return '上传已暂停'
  return ''
})

onMounted(() => {
  // 组件挂载时的初始化操作
})
</script>

<style scoped>
.video-upload-container {
  max-width: 800px;
  margin: 2rem auto;
}

.upload-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding-bottom: 1rem;
}

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 1rem;
}

.upload-area:hover {
  border-color: #409eff;
  background-color: #f5f7fa;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #666;
}

.upload-icon {
  font-size: 3rem;
  color: #409eff;
}

.upload-text {
  font-size: 1rem;
  font-weight: 500;
}

.file-info {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin: 0 1rem;
}

.file-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.file-icon {
  font-size: 1.5rem;
  color: #409eff;
}

.file-meta {
  flex: 1;
  text-align: left;
}

.upload-progress {
  width: 100%;
  margin: 0.5rem 0;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.upload-controls {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-start;
  flex-wrap: wrap;
  margin: 0 1rem;
}

.success-alert,
.error-alert {
  margin: 1rem;
}
</style>
