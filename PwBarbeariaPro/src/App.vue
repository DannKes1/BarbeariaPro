<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import NavSideBar from './components/NavSideBar.vue'
import NavBarExpand from './components/NavBarExpand.vue'
</script>

<template>
  <NavSideBar />
  <NavBarExpand />

  <RouterView />
</template>

<style scoped></style>
