<template>
  <el-container>
    <el-main>
      <el-table v-loading="listLoading" :data="tableData" stripe border style="width: 100%;">
        <el-table-column type="index" label="编号" width="80" align="center" />
        <el-table-column prop="username" label="用户名" width="200" align="center" />
        <el-table-column prop="nickname" label="昵称" width="220" align="center" />
        <el-table-column prop="avatar" label="头像" width="150" align="center">
          <template slot-scope="scope">
            <el-avatar size="large" :src="scope.row.avatar" />
          </template>
        </el-table-column>
        <el-table-column prop="roles" label="角色" width="200" align="center" />
        <el-table-column prop="email" label="邮箱" width="300" align="center" />
        <el-table-column label="状态" width="120" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.state === 'valid' ? 'success' : 'danger'" size="medium">{{ scope.row.state === 'valid' ? '正常' : '冻结' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="创建时间" width="200" align="center" />
        <el-table-column align="center" label="操作" width="300">
          <template slot-scope="scope">
            <el-button v-permission="'audience'" type="primary" size="small" icon="el-icon-edit">修改</el-button>
            <el-button v-permission="'audience'" :type="scope.row.state === 'valid' ? 'danger' : 'success'" size="small" @click="handleFrozen(scope.row)">
              <svg-icon icon-class="freeze" class="btn-icon" />{{ scope.row.state === 'valid' ? '冻结' : '解封' }}
            </el-button>
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
import { fetchUsersList, frozenUser } from '@/api/user'
import permission from '@/directive/permission/index.js' // 权限判断指令
export default {
  name: 'UsersList',
  directives: {
    permission
  },
  data() {
    return {
      listLoading: false,
      tableData: null,
      frozenState: true,
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
    handleFrozen(row) { // 冻结/解封用户
      const currentState = row.state === 'valid' ? 'frozen' : 'valid'
      const tipText = row.state === 'valid' ? '冻结' : '解封'

      this.$confirm(`确认${tipText}该用户`, '操作确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const params = {
          id: row.id,
          state: currentState
        }
        frozenUser(params).then(res => {
          this.$message({
            type: 'success',
            message: `${tipText}成功!`
          })
          this.fetchList()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: `已取消${tipText}！`
        })
      })

      // if (row.state === 'valid') { // 冻结

      // } else { // 解封
      //   this.$confirm('确认解封该用户', '操作确认', {
      //     confirmButtonText: '确定',
      //     cancelButtonText: '取消',
      //     type: 'warning'
      //   }).then(() => {
      //     const params = {
      //       id: row.id,
      //       state: 'valid'
      //     }
      //     frozenUser(params).then(res => {
      //       this.$message({
      //         type: 'success',
      //         message: '解封成功!'
      //       })
      //       this.fetchList()
      //     })
      //   }).catch(() => {
      //     this.$message({
      //       type: 'info',
      //       message: '已取消删除'
      //     })
      //   })
      // }
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

<style>
  .el-pagination {
    margin-top: 35px;
  }
  .btn-icon {
    margin-right: 5px;
  }
</style>
