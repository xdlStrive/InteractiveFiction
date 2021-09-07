<template>
  <div class="app-container">
    <el-button class="add-aphorism-btn" type="primary" @click="addDialogVisible = true; dialogTitle = '新增名言'; btnType = true">新增名言</el-button>
    <el-table
      v-loading="loading"
      :data="listData"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="编号" width="95">
        <template slot-scope="scope">
          {{ scope.row.aphorism_id }}
        </template>
      </el-table-column>
      <el-table-column label="内容">
        <template slot-scope="scope">
          {{ scope.row.text }}
        </template>
      </el-table-column>
      <el-table-column label="出处" width="200" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.author }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="创建时间" width="200">
        <template slot-scope="scope">
          <i class="el-icon-time" />
          <span>{{ scope.row.create_time }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="300">
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="small"
            icon="el-icon-edit"
            @click="addDialogVisible = true;
                    dialogTitle = '修改名言';
                    btnType = false;
                    currentAphorismID = scope.row.aphorism_id;
                    form.text = scope.row.text;
                    form.author = scope.row.author"
          >
            修改
          </el-button>
          <el-button type="danger" size="small" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      :current-page.sync="paginationParams.page"
      layout="total, sizes, prev, pager, next, jumper"
      :page-sizes="[20,30,40,50]"
      :page-size="paginationParams.limit"
      :total="paginationParams.total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <el-dialog :title="dialogTitle" :visible.sync="addDialogVisible">
      <el-form :model="form">
        <el-form-item label="名言内容" label-width="120px">
          <el-input v-model="form.text" autocomplete="off" />
        </el-form-item>
        <el-form-item label="是谁说的" label-width="120px">
          <el-input v-model="form.author" autocomplete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button v-if="btnType" type="primary" @click="addAphorismFn();addDialogVisible = false">提 交</el-button>
        <el-button v-if="!btnType" type="primary" @click="handelEdit();addDialogVisible = false">修 改</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchAphorismList, addAphorism, modifyAphorism, deleteAphorism } from '@/api/aphorism'

export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      listData: null,
      addDialogVisible: false,
      loading: true,
      dialogTitle: '新增名言',
      btnType: true,
      currentAphorismID: null,
      form: {
        text: '',
        author: ''
      },
      paginationParams: {
        page: 1,
        limit: 20,
        total: 0
      }
    }
  },
  created() {
    this.fetchList()
  },
  methods: {
    addAphorismFn() {
      let data = {
        text: this.form.text,
        author: this.form.author
      }
      addAphorism(data).then(res => {
        this.$message({
          message: res.msg,
          type: 'success'
        })
        this.fetchList()
      })
    },
    fetchList() {
      fetchAphorismList().then(res => {
        this.listData = res.data
        this.loading = false
      })
    },
    handelEdit() {
      if (this.currentAphorismID !== 0) {
        const data = {
          aphorism_id: this.currentAphorismID,
          text: this.form.text,
          author: this.form.author
        }
        modifyAphorism(data).then(res => {
          this.$message({
            message: res.msg,
            type: 'success'
          })
          this.fetchList()
        })
      }
    },
    handleDelete(row) {
      const data = {
        aphorism_id: row.aphorism_id
      }
      deleteAphorism(data).then(res => {
        this.$message({
          message: res.msg,
          type: 'success'
        })
        this.fetchList()
      })
    },
    handleSizeChange(val) {
      this.paginationParams.limit = val
      this.fetchList()
    },
    handleCurrentChange(val) {
      this.paginationParams.page = val
      this.fetchList()
    }
  }
}
</script>

<style scoped>
  .add-aphorism-btn {
    margin-bottom: 15px;
  }
  .el-pagination {
    margin-top: 35px;
  }
</style>
