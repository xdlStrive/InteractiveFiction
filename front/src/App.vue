<template>
  <div class="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
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
.app {
  height: calc(100% - 61px);
}
</style>
