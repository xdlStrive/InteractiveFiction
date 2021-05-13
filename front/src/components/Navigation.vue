<!-- 导航组件 -->
<template>
  <el-menu :default-active="activeIndex" mode="horizontal" router class="navigationBox">
    <el-menu-item index="1" route="/book">异世界</el-menu-item>
    <el-menu-item index="3" route="/safe-house">安全屋</el-menu-item>
    <el-menu-item index="4" route="/login">登录注册</el-menu-item>
  </el-menu>
</template>

<script>
import { ElMenu, ElMenuItem } from 'element-plus'
export default {
  name: 'Navigation',
  components: {
    ElMenu, ElMenuItem
  },
  data() {
    return {
      activeIndex: '1',
    }
  }
}
</script>

<style scoped>
  .navigationBox {
    padding-left: 55px;
  }
</style>