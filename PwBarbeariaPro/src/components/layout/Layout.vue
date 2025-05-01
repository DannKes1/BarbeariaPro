<template>
  <!-- agora binding da classe collapsed -->
  <div :class="['wrapper', { collapsed }]">
    <Sidebar />
    <div class="main">
      <!-- recebe o evento do Navbar -->
      <Navbar @toggleSidebar="toggleSidebar" />
      <main class="content">
        <router-view />
      </main>
      <Footer />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import feather from "feather-icons";

import Sidebar from "./Sidebar.vue";
import Navbar from "./Navbar.vue";
import Footer from "./Footer.vue";

export default defineComponent({
  name: "Layout",
  components: { Sidebar, Navbar, Footer },
  setup() {
    const collapsed = ref(false);

    function toggleSidebar() {
      collapsed.value = !collapsed.value;
    }

    onMounted(() => {
      feather.replace(); 
    });

    return { collapsed, toggleSidebar };
  },
});
</script>

<style scoped>

.wrapper.collapsed .sidebar {
  margin-left: -250px;
}
.wrapper.collapsed .main {
  margin-left: 0;
}
</style>
