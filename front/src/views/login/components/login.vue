<template>
  <el-row class="rowBox">
    <el-col :xs="{span: 24, offset: 0}" :sm="{span: 16, offset: 4}" :md="{span: 12, offset: 6}" :lg="{span: 8, offset: 8}" :xl="{span: 4, offset: 10}">
      <div class="titleBox">
        <h2 class="title">登 录</h2>
      </div>
      <el-form>
        <el-form-item>
          <el-input prefix-icon="el-icon-user" placeholder="用户名" v-model="form.username" />
        </el-form-item>
        <el-form-item>
          <el-input prefix-icon="el-icon-lock" placeholder="密码" v-model="form.password" show-password />
        </el-form-item>
        <el-form-item class="loginBtnBox">
          <el-button type="primary" class="loginBtn" @click="handleLogin">登 录</el-button>
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
.titleBox {
  margin: 80px 0 30px;
  text-align: center;
  color: #444;
}
.loginBtn {
  width: 100%;
  margin-top: 15px;
}
</style>