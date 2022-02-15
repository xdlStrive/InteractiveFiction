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
const show = ref(true);

// export default {
//   name: 'Login',
//   components: { LoginFrom, RegisterForm },
//   data () {
//     return {
//       formType: true,
//       show: true
//     }
//   },
//   methods: {}
// }

</script>
<style>

</style>