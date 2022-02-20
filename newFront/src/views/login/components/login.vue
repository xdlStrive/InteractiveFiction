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
      <el-form :model="form" :rules="rules">
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
import { userLogin } from '@/api/user'
const userInfoStore = userInfo()
const router = useRouter()

const rules = {
  username: [{required: true, message: '用户名不能为空', trigger: 'blur'}],
  password: [{required: true, message: '密码不能为空', trigger: 'blur'}]
}

let loading = ref(true)
const form = reactive({
  username: '',
  password: ''
})

const handleLogin = () => {
  loading.value = true
  userLogin(form).then((res) => {
    if (res.code === 20000) {
      userInfoStore.login(res)
      router.push({name: 'book'})
    }
  })
  // userInfoStore.login(form).then(() => {
  //   loading.value = false
  //   router.push({ path: '/book' })
  //   // userInfoStore.dispatch('user/getInfo', userInfoStore.state.user.token).then(res => {
  //   //   console.log(res)
  //   // })
  // }).catch(() => {
  //   loading.value = false
  // })
  // userInfoStore.login(form).then(() => {
  //   loading.value = false
  //   router.push({ path: '/book' })
  //   // userInfoStore.dispatch('user/getInfo', userInfoStore.state.user.token).then(res => {
  //   //   console.log(res)
  //   // })
  // }).catch(() => {
  //   loading.value = false
  // })

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