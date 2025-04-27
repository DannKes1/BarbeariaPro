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
import Blank from "./Blank.vue";

export default defineComponent({
  name: "Layout",
  components: { Sidebar, Navbar, Footer, Blank },
  setup() {
    const collapsed = ref(false);

    function toggleSidebar() {
      collapsed.value = !collapsed.value;
    }

    onMounted(() => {
      feather.replace(); // renderiza todos os ícones feather no app
    });

    return { collapsed, toggleSidebar };
  },
});
</script>

<style scoped>
/* se por acaso o seu app.css não tiver,
   defina como a sidebar “some” quando collapsed */
.wrapper.collapsed .sidebar {
  margin-left: -250px; /* ou largura da sua sidebar */
}
.wrapper.collapsed .main {
  margin-left: 0;
}
</style>
