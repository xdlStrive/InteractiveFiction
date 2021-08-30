<!-- 主页 -->
<template>
  <div class="page-box">
    <Navigation />
    <Content />
  </div>
</template>

<script>
// import { ElScrollbar, ElMessage } from 'element-plus'
// import { fetchOneChapter } from '@/api/chapter'
import Navigation from '@/components/Navigation'
import Content from './components/Content'
// import { h } from 'vue';

export default {
	components: {
    Navigation,
    Content
  },
  data () {
    return {
      
    };
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