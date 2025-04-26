<template>
    <div class="wrapper">
      <Sidebar />
      <div class="main">
        <Navbar />
        <main class="content">
          <router-view />
        </main>
        <Footer />
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue'
  import Sidebar from './Sidebar.vue'
  import Navbar from './Navbar.vue'
  import Footer from './Footer.vue'
  
  export default defineComponent({
    name: 'Layout',
    components: {
      Sidebar,
      Navbar,
      Footer
    }
  })
  </script>
  
  <style scoped>
  </style>