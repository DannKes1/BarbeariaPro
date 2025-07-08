<template>
  <nav class="navbar navbar-expand navbar-light navbar-bg">
    <a
      href="#"
      class="sidebar-toggle js-sidebar-toggle"
      @click.prevent="$emit('toggleSidebar')"
    >
      <i class="hamburger align-self-center"></i>
    </a>

    <div class="navbar-collapse collapse">
      <ul class="navbar-nav navbar-align">
        <li class="nav-item dropdown">
          <a
            class="nav-link dropdown-toggle d-none d-sm-inline-block"
            href="#"
            data-bs-toggle="dropdown"
          >
            <img
              src="@/assets/img/avatars/image.png"
              class="avatar img-fluid rounded me-1"
              alt="Charles Hall"
            />
            <span class="text-dark">João Silva</span>
          </a>
          <div class="dropdown-menu dropdown-menu-end">
            <router-link class="dropdown-item" to="/profile">
              <i class="align-middle me-1" data-feather="user"></i>
              Profile
            </router-link>

            <div class="dropdown-divider"></div>
            <a class="dropdown-item" href="#">Log out</a>
          </div>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import feather from "feather-icons";

export default defineComponent({
  name: "Navbar",
  emits: ["toggleSidebar"],
  setup() {
    onMounted(() => {
      feather.replace();
    });
  },
});
</script>

<style scoped>
@import "@/assets/css/app.css";
</style>
