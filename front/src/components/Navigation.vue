<!-- 导航组件 -->
<template>
  <el-menu :default-active="$route.path" mode="horizontal" router class="navigation-box" background-color="#545c64" text-color="#fff" active-text-color="#ffd04b">
    <el-menu-item index="/book" route="">异世界</el-menu-item>
    <el-menu-item index="/safe-house" route="">安全屋</el-menu-item>
    <el-menu-item index="3" route="/login">圆桌会议</el-menu-item>
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
      
    }
  }
}
</script>

<style scoped>
  .navigation-box {
    width: 100%;
    padding-left: 55px;
  }
</style>