<!-- 登录页 -->
<template>
  <div>
    <LoginFrom v-if="formType" v-model:formType="formType" />
    <RegisterForm v-if="!formType" v-model:formType="formType" />
  </div>
</template>

<script>
import LoginFrom from './components/login'
import RegisterForm from './components/register'

export default {
  name: 'Login',
  components: { LoginFrom, RegisterForm },
  data () {
    return {
      formType: true
    };
  },
  methods: {}
}

</script>
<style lang='scss' scoped>
</style>