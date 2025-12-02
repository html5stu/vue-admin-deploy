<template>
  <div class="article">
    <el-card
      style="max-width: 480px"
      v-for="item in articleList"
      :key="item.article_id"
    >
      <div class="text item">
        <p>标题：{{ item.title }}</p>
        <p>内容：{{ item.content }}</p>
        <el-button type="primary" @click="delArticle(item.article_id)"
          >删除</el-button
        >
      </div>
    </el-card>
    <el-button type="primary" @click="showPubDialog">发布文章</el-button>
    <!-- 发布文章弹框 -->
    <el-dialog title="发布文章" v-model="dialogFormVisible">
      <el-form :model="form">
        <el-form-item label="文章标题" :label-width="formLabelWidth">
          <el-input v-model="form.title" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="文章内容" :label-width="formLabelWidth">
          <el-input v-model="form.content" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="pubArticle">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { addArticle, getArticleList, deleteArticle } from '@/api/article'
const message = ref('This is your article content.')
const articleList = ref([])
const dialogFormVisible = ref(false)
const formLabelWidth = '120px'
const form = reactive({})

onMounted(() => {
  _getArticleList()
})
const showPubDialog = () => {
  dialogFormVisible.value = true
}

const pubArticle = () => {
  addArticle(form).then((res) => {
    console.log('发布文章', res)
    dialogFormVisible.value = false
    _getArticleList()
  })
}

const _getArticleList = () => {
  getArticleList().then((res) => {
    console.log('文章列表', res)
    articleList.value = res.data
  })
}
const delArticle = (id) => {
  deleteArticle(id).then((res) => {
    console.log('删除文章', res)
    _getArticleList()
  })
}
</script>

<style scoped lang="scss">
.article {
  padding: 2rem;
  font-family: Arial, sans-serif;
}
</style>
