<template>
  <div class="app-container">
    <el-button @click="addDialogVisible = true">新增名言</el-button>
    <el-table
      :data="listData"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="ID" width="95">
        <template slot-scope="scope">
          {{ scope.$index }}
        </template>
      </el-table-column>
      <el-table-column label="内容">
        <template slot-scope="scope">
          {{ scope.row.text }}
        </template>
      </el-table-column>
      <el-table-column label="作者" width="200" align="center">
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
    </el-table>

    <el-dialog title="新增名言" :visible.sync="addDialogVisible">
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
        <el-button type="primary" @click="addAphorismFn();addDialogVisible = false">提 交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchAphorism, addAphorism } from '@/api/aphorism'

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
      form: {
        text: '',
        author: ''
      }
    }
  },
  created() {
    fetchAphorism().then(res => {
      console.log(res.data)
      this.listData = res.data
    })
  },
  methods: {
    addAphorismFn() {
      let data = {
        text: this.form.text,
        author: this.form.author
      }
      addAphorism(data).then(res => {
        console.log(res)
        // this.list = response.data.items
      })
    }
  }
}
</script>
