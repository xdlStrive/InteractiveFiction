<!-- 主页 -->
<template>
  <div class="page-box">
    <Navigation />
    <Content />
  </div>
</template>

<script>
import Navigation from '@/components/Navigation'
import Content from './components/Content'

export default {
	components: {
    Navigation,
    Content
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
    display: flex;
    flex-wrap: wrap;
	}
</style>