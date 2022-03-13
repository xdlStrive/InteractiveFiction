<!-- 登录页 -->
<template>
  <div>
    <LoginFrom v-if="formType" v-model:formType="formType" />
    <RegisterForm v-if="!formType" v-model:formType="formType" />
  </div>
</template>

<script setup lang="ts">
import LoginFrom from './components/login.vue'
import RegisterForm from './components/register.vue'

import { ref } from 'vue'

const formType = ref(true);

</script>
<style>
  .registerLink {
    text-align: right;
    line-height: 25px;
    color: #409eff;
    cursor: pointer;
  }
</style>