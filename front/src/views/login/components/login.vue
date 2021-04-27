<template>
  <el-form>
    <el-form-item label="账号：">
      <el-input v-model="form.username" />
    </el-form-item>
    <el-form-item label="密码：">
      <el-input v-model="form.password" />
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: 'LoginFrom',
  data() {
    return {
      from: {
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
      console.log(this.from.username)
    }
  }
}
</script>

<style scoped>
  
</style>