<template>
  <el-row class="rowBox">
    <el-col
      :xs="{ span: 24, offset: 0 }"
      :sm="{ span: 16, offset: 4 }"
      :md="{ span: 12, offset: 6 }"
      :lg="{ span: 6, offset: 9 }"
      :xl="{ span: 4, offset: 10 }"
    >
      <div class="titleBox">
        <h2 class="title">愚 者</h2>
      </div>
      <el-form :model="form">
        <el-form-item>
          <el-input prefix-icon="el-icon-user" placeholder="用户名" v-model="form.username" />
        </el-form-item>
        <el-form-item>
          <el-input
            prefix-icon="el-icon-lock"
            placeholder="密码"
            v-model="form.password"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <div class="registerLink" @click="$emit('update:formType', false)">创建身份...</div>
          <el-button type="primary" class="loginBtn" @click="handleLogin">开启旅途</el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import userInfo from '@/store/userInfo'
import { useRouter } from 'vue-router';
const userInfoStore = userInfo()
const router = useRouter()

let loading = ref(true)
const form = reactive({
  username: '',
  password: ''
})

const handleLogin = () => {
  if (form.username === '') {
    ElMessage({
      message: '请输入用户名',
      type: 'warning'
    })
  } else if (form.password === '') {
    ElMessage({
      message: '请输入密码',
      type: 'warning'
    })
  } else {
    loading.value = true
    userInfoStore.login(form).then(() => {
      loading.value = false
      router.push({ path: '/book' })
      // userInfoStore.dispatch('user/getInfo', userInfoStore.state.user.token).then(res => {
      //   console.log(res)
      // })
    }).catch(() => {
      loading.value = false
    })
    userInfoStore.login(form).then(() => {
      loading.value = false
      router.push({ path: '/book' })
      // userInfoStore.dispatch('user/getInfo', userInfoStore.state.user.token).then(res => {
      //   console.log(res)
      // })
    }).catch(() => {
      loading.value = false
    })
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
  color: #409eff;
  cursor: pointer;
}
.loginBtn {
  width: 100%;
  margin-top: 10px;
  font-size: 17px;
}
</style>