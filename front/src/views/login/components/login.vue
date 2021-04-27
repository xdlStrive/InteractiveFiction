<template>
  <el-form :inline="true">
    <el-form-item label="账号：">
      <el-input v-model="form.username" />
    </el-form-item>
    <el-form-item label="密码：">
      <el-input v-model="form.password" />
    </el-form-item>
  </el-form>
</template>

<script>
import { ElForm, ElFormItem, ElInput } from 'element-plus'
import { userLogin } from '@/api/user'

export default {
  name: 'LoginFrom',
  components: {
    ElForm,
    ElFormItem,
    ElInput
  },
  data() {
    return {
      form: {
        username: '',
        password: ''
      }
    }
  },
  created() {
    this.handleLogin()
  },
  methods: {
    handleLogin() {
      const params = {
        username: this.form.username,
        password: this.form.password
      }
      userLogin(params).then(res => {
        console.log(res)
      })
    }
  }
}
</script>

<style scoped>
  
</style>