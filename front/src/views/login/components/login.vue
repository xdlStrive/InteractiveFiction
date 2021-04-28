<template>
  <el-row type="flex" align="middle" class="rowBox">
    <el-col :xs="{span: 24, offset: 0}" :sm="{span: 16, offset: 4}" :md="{span: 12, offset: 6}" :lg="{span: 8, offset: 8}" :xl="{span: 6, offset: 9}">
      <el-form label-width="80px">
        <el-form-item label="账号：">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="密码：">
          <el-input placeholder="请输入密码" v-model="form.password" show-password />
        </el-form-item>
        <el-form-item label-width="auto" class="loginBtnBox">
          <el-button type="primary" class="loginBtn" @click="handleLogin">登录</el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<script>
import { ref } from 'vue'
import { ElRow, ElCol, ElForm, ElFormItem, ElInput, ElButton, ElMessage } from 'element-plus'
import { userLogin } from '@/api/user'

export default {
  name: 'LoginFrom',
  components: {
    ElRow,
    ElCol,
    ElForm,
    ElFormItem,
    ElInput,
    ElButton,
    ElMessage
  },
  setup() {
    return {
      input: ref('')
    }
  },
  data() {
    return {
      form: {
        username: '',
        password: ''
      }
    }
  },
  methods: {
    handleLogin() {
      if (this.form.username === '') {
        ElMessage({
          message: '请输入用户名',
          type: 'warning'
        })
      } else if (this.form.password === '') {
        ElMessage({
          message: '请输入密码',
          type: 'warning'
        })
      } else {
        const params = {
          username: this.form.username,
          password: this.form.password
        }
        userLogin(params).then(res => {
          ElMessage({
            message: res.msg,
            type: 'success'
          })
        })
      }
    }
  }
}
</script>

<style scoped>
.rowBox {
  height: 100%;
}
.loginBtnBox {
  text-align: center;
}
.loginBtn {
  width: 200px;
  margin-top: 15px;
}
</style>