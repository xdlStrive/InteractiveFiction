<template>
  <Navigation />
  <router-view />
</template>

<script>
import Navigation from '@/components/Navigation'
export default {
  name: 'App',
  components: {
    Navigation
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
}
ul,li {
  list-style: none;
}
html, body, #app {
  height: 100%;
}
</style>
