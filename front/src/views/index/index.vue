<!-- 主页 -->
<template>
  <div class="page-box">
    <Navigation />
    <List />
    <Content />
  </div>
</template>

<script>
// import { ElScrollbar, ElMessage } from 'element-plus'
// import { fetchOneChapter } from '@/api/chapter'
import Navigation from '@/components/Navigation'
import Content from './components/Content'
import List from './components/List'
// import { h } from 'vue';

export default {
	components: {
    Navigation,
    Content,
    List
  },
  data () {
    return {
      
    }
  },
  methods: {
  }
}
</script>

<style lang='scss' scoped>
  .page-box {
		height: 100%;
	}
</style>