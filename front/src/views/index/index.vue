<!-- 主页 -->
<template>
  <div class="page-box">
    <Content />
  </div>
</template>

<script>
// import { ElScrollbar, ElMessage } from 'element-plus'
// import EasyTyper from 'easy-typer-js'
// import { fetchOneChapter } from '@/api/chapter'
import Content from './components/Content'
// import { h } from 'vue';

export default {
	components: {
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