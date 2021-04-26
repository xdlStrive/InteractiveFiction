<template>
  <el-container>
    <el-main>
      <el-table v-loading="listLoading" :data="tableData" stripe border style="width: 100%;">
        <el-table-column type="index" label="编号" width="100" align="center" />
        <el-table-column prop="username" label="用户名" width="200" align="center" />
        <el-table-column prop="nickname" label="用户昵称" width="200" align="center" />
        <el-table-column prop="password" label="用户密码" width="200" align="center" />
        <el-table-column prop="roles" label="用户角色" width="200" align="center" />
        <el-table-column prop="email" label="用户邮箱" width="200" align="center" />
        <el-table-column prop="create_time" label="创建时间" width="200" align="center" />
        <el-table-column align="center" label="操作" width="300">
        <template slot-scope="scope">
          <el-button type="primary" size="small" icon="el-icon-edit">修改</el-button>
          <el-button type="danger" size="small" icon="el-icon-delete" @click="handleDelete(scope.row)">冻结</el-button>
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
    </el-main>
  </el-container>
</template>

<script>
import { fetchUsersList } from '@/api/user'
export default {
  name: 'UsersList',
  data() {
    return {
      listLoading: false,
      tableData: null,
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
    fetchList() {
      const params = {
        pageNum: this.paginationParams.page,
        pageSize: this.paginationParams.limit
      }
      fetchUsersList(params).then(res => {
        console.log(res)
        this.tableData = res.data
        this.paginationParams.total = res.count
        console.log(this.tableData)
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
  .el-pagination {
    margin-top: 35px;
  }
</style>
