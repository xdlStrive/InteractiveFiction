<template>
  <div class="app">
    <!-- <NavigationVue /> -->
    <router-view />
  </div>
</template>

<script setup lang="ts">
import NavigationVue from '@com/Navigation.vue';
</script>

<style>
* {
  margin: 0;
  padding: 0;
}
ul,li {
  list-style: none;
}
html, body, #app, .app  {
  height: 100%;
}
</style>

