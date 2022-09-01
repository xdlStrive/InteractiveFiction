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
      <el-form ref="loginFormRef" :model="form" :rules="rules" v-loading="loading">
        <el-form-item prop="username">
          <el-input prefix-icon="el-icon-user" placeholder="用户名" v-model="form.username" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            prefix-icon="el-icon-lock"
            placeholder="密码"
            v-model="form.password"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <div class="registerLink" @click="$emit('update:formType', false)">创建身份...</div>
          <el-button type="primary" class="loginBtn" @click="handleLogin(loginFormRef)">开启旅途</el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
  import { ref, reactive } from 'vue'
  import type { FormInstance } from 'element-plus'
  import userInfo from '@/store/userInfo'
  import { useRouter } from 'vue-router';
  import { userLogin } from '@/api/user'
  const userInfoStore = userInfo()
  const router = useRouter()

  const form = reactive({
    username: '',
    password: ''
  })

  const loginFormRef = ref<FormInstance>()

  const rules = reactive({
    username: [
      {required: true, message: '用户名不能为空', trigger: 'blur'}],
    password: [
      {required: true, message: '密码不能为空', trigger: 'blur'},
      {min: 4, message: '最少输入6位', trigger: 'blur'}
    ]
  })

  let loading = ref(false)

  const handleLogin = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate(async (valid: boolean) => {
      if (valid) {
        console.log(form)
        loading.value = true
        await userLogin(form).then((res) => {
          if (res.code === 20000) {
            userInfoStore.login(res)
            console.log('存完了')
            router.push({name: 'book'})
          } else {
            loading.value = false
          }
        }, reason => {
          loading.value = false
        })
      } else {
        return false
      }
   })
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
  .loginBtn {
    width: 100%;
    margin-top: 10px;
    font-size: 17px;
  }
</style>