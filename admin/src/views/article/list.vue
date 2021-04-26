<template>
  <div class="app-container">
    <el-table v-loading="listLoading" :data="tableData" stripe border style="width: 100%;">
      <el-table-column type="index" label="章节编号" width="100" align="center" />
      <el-table-column prop="title" label="章节名" min-width="150" />
      <el-table-column prop="roundup" label="摘要" class-name="roundup" min-width="300" />
      <el-table-column prop="author.username" label="作者" width="200" align="center" />
      <el-table-column prop="creationTime" label="发布时间" width="200" align="center" />
      <el-table-column align="center" label="操作" width="300">
        <template slot-scope="scope">
          <el-button type="primary" size="small" icon="el-icon-edit">修改</el-button>
          <el-button type="danger" size="small" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      :current-page.sync="currentPage"
      layout="total, sizes, prev, pager, next, jumper"
      :page-sizes="[20,30,40,50]"
      :page-size="listQuery.limit"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script>
import { fetchAllChapterList } from '@/api/chapter'

export default {
  name: 'ArticleList',
  data() {
    return {
      tableData: null,
      total: 0,
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 20
      },
      currentPage: 1
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      const params = {
        pageNum: this.listQuery.page,
        pageSize: this.listQuery.limit
      }
      fetchAllChapterList(params).then(res => {
        this.listLoading = false
        this.tableData = res.data
        this.total = res.totalCount
      })
    },
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.getList()
    },
    handleCurrentChange(val) {
      console.log(val)
    },
    // handleDelete(row) {
    //   this.$confirm('此操作将永久删除该文件，是否继续？', '提示', {
    //     confirmButtonText: '确定',
    //     cancelButtonText: '取消',
    //     type: 'warning',
    //     center: true
    //   }).then(() => {
    //     const params = { id: row.id }
    //     deleteArticle(params).then(res => {
    //       if (res.code === 20000) {
    //         this.$message({
    //           type: 'success',
    //           message: '删除成功！'
    //         })
    //         this.getList() // 需刷新数据时最好不要直接刷新页面（开销太大），可以重新获取一次数据即可达到同样的效果
    //       }
    //     })
    //   }).catch(() => {
    //     this.$message({
    //       type: 'info',
    //       message: '已取消删除操作'
    //     })
    //   })
    // }
  }
}
</script>

<style scoped>
  .el-pagination {
    margin-top: 35px;
  }
  .roundup > div {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
</style>
