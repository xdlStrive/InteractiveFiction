<template>
    <el-row class="rowBox">
    <el-col :xs="{span: 24, offset: 0}" :sm="{span: 16, offset: 4}" :md="{span: 12, offset: 6}" :lg="{span: 6, offset: 9}" :xl="{span: 4, offset: 10}">
      <div class="titleBox">
        <h2 class="title">注 册</h2>
      </div>
      <el-form :model="form">
        <el-form-item>
          <el-input prefix-icon="el-icon-user" placeholder="用户名" v-model="form.username" />
        </el-form-item>
        <el-form-item>
          <el-input prefix-icon="el-icon-lock" placeholder="密码" v-model="form.password" show-password />
        </el-form-item>
        <el-form-item>
          <el-input prefix-icon="el-icon-lock" placeholder="再次确认密码" v-model="form.secondPassword" show-password />
        </el-form-item>
        <el-form-item>
          <div class="registerLink" @click="$emit('update:formType', true)">我已创建，切换登录</div>
          <el-button type="primary" class="registerBtn" @click="handleRegister">创建身份</el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
  import { reactive } from 'vue'
  import { userRegister } from '@/api/user'

  const props = defineProps<{
    formType?: boolean
  }>()

  const form = reactive({
    username: '',
    password: '',
    secondPassword: ''
  })

  function handleRegister() {
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
    } else if (form.secondPassword === '' || form.secondPassword !== form.password) {
      ElMessage({
        message: '两次输入密码不一致',
        type: 'warning'
      })
    } else {
      userRegister(form).then(res => {
        ElMessage({
          message: res.msg,
          type: 'success'
        })
        $emit('update:props.formType', true)
      })
    }
  }

// export default {
//   name: 'registerForm',
//   props: {
//     formType: {
//       type: Boolean,
//       default: false
//     }
//   },
//   data() {
//     return {
//       form: {
//         username: '',
//         password: '',
//         secondPassword: ''
//       }
//     }
//   },
//   methods: {
//     handleRegister() {
//       if (form.username === '') {
//         ElMessage({
//           message: '请输入用户名',
//           type: 'warning'
//         })
//       } else if (form.password === '') {
//         ElMessage({
//           message: '请输入密码',
//           type: 'warning'
//         })
//       } else if (form.secondPassword === '' || form.secondPassword !== form.password) {
//         ElMessage({
//           message: '两次输入密码不一致',
//           type: 'warning'
//         })
//       } else {
//         userRegister(form).then(res => {
//           ElMessage({
//             message: res.msg,
//             type: 'success'
//           })
//           $emit('update:formType', true)
//         })
//       }
//     }
//   }
// }
</script>

<style>
  .rowBox {
    height: 100%;
  }
  .titleBox {
    margin: 70% 0 30px;
    text-align: center;
    color: #444;
  }
  .registerBtn {
    width: 100%;
    margin-top: 15px;
    font-size: 17px;
  }
</style>