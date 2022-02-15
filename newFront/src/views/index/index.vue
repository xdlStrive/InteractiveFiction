<!-- 主页 -->
<template>
  <div class="page-box">
    <Navigation />
    <Content />
  </div>
</template>

<script setup lang="ts">
import Navigation from '@com/Navigation.vue'
import Content from './components/Content.vue'
</script>

<style scoped>
  .page-box {
		height: 100%;
    display: flex;
    flex-wrap: wrap;
	}
</style>