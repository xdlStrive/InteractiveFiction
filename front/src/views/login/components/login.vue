<template>
  <el-row class="rowBox">
    <el-col :xs="{span: 24, offset: 0}" :sm="{span: 16, offset: 4}" :md="{span: 12, offset: 6}" :lg="{span: 6, offset: 9}" :xl="{span: 4, offset: 10}">
      <div class="titleBox">
        <h2 class="title">愚 者</h2>
      </div>
      <el-form :model="form">
        <el-form-item>
          <el-input prefix-icon="el-icon-user" placeholder="用户名" v-model="form.username" />
        </el-form-item>
        <el-form-item>
          <el-input prefix-icon="el-icon-lock" placeholder="密码" v-model="form.password" show-password />
        </el-form-item>
        <el-form-item>
          <div class="registerLink" @click="$emit('update:formType', false)">创建身份...</div>
          <el-button type="primary" class="loginBtn" @click="handleLogin">开始旅途</el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<script>
import { ref } from 'vue'
import { ElRow, ElCol, ElForm, ElFormItem, ElInput, ElButton, ElMessage } from 'element-plus'

export default {
  name: 'LoginFrom',
  components: {
    ElRow, ElCol, ElForm, ElFormItem, ElInput, ElButton
  },
  props: {
    formType: {
      type: Boolean,
      default: true
    }
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
        this.loading = true
        this.$store.dispatch('user/login', this.form).then(res => {
          this.$router.push({ path: '/book' })
          this.loading = false
          ElMessage({
            message: res.msg,
            type: 'success'
          })
        }).catch(() => {
          this.loading = false
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
  margin: 70% 0 30px;
  text-align: center;
  color: #444;
}
.registerLink {
  text-align: right;
  line-height: 25px;
  color: #409EFF;
  cursor: pointer;
}
.loginBtn {
  width: 100%;
  margin-top: 10px;
  font-size: 17px;
}
</style>