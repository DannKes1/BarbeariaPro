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
            class="nav-icon dropdown-toggle"
            href="#"
            id="alertsDropdown"
            data-bs-toggle="dropdown"
          >
            <div class="position-relative">
              <i class="align-middle" data-feather="bell"></i>
              <span class="indicator">4</span>
            </div>
          </a>
          <div
            class="dropdown-menu dropdown-menu-lg dropdown-menu-end py-0"
            aria-labelledby="alertsDropdown"
          ></div>
        </li>

        <li class="nav-item dropdown">
          <a
            class="nav-icon dropdown-toggle"
            href="#"
            id="messagesDropdown"
            data-bs-toggle="dropdown"
          >
            <div class="position-relative">
              <i class="align-middle" data-feather="message-square"></i>
            </div>
          </a>
          <div
            class="dropdown-menu dropdown-menu-lg dropdown-menu-end py-0"
            aria-labelledby="messagesDropdown"
          ></div>
        </li>

        <li class="nav-item dropdown">
          <a
            class="nav-link dropdown-toggle d-none d-sm-inline-block"
            href="#"
            data-bs-toggle="dropdown"
          >
            <img
              src="@/assets/img/avatars/avatar.jpg"
              class="avatar img-fluid rounded me-1"
              alt="Charles Hall"
            />
            <span class="text-dark">Charles Hall</span>
          </a>
          <div class="dropdown-menu dropdown-menu-end">
            <router-link class="dropdown-item" to="/profile">
              <i class="align-middle me-1" data-feather="user"></i>
              Profile
            </router-link>
            <a class="dropdown-item" href="#">
              <i class="align-middle me-1" data-feather="pie-chart"></i>
              Analytics
            </a>
            <div class="dropdown-divider"></div>
            <a class="dropdown-item" href="#">
              <i class="align-middle me-1" data-feather="settings"></i>
              Settings & Privacy
            </a>
            <a class="dropdown-item" href="#">
              <i class="align-middle me-1" data-feather="help-circle"></i>
              Help Center
            </a>
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
