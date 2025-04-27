<template>
  <nav id="sidebar" class="sidebar js-sidebar">
    <div class="sidebar-content js-simplebar">
      <router-link class="sidebar-brand" to="/">
        <span class="align-middle">AdminKit</span>
      </router-link>

      <ul class="sidebar-nav">
        <li class="sidebar-header">Páginas</li>
        <li
          v-for="item in sections[0].items"
          :key="item.name"
          :class="['sidebar-item', { active: $route.path === item.path }]"
        >
          <router-link :to="item.path" class="sidebar-link">
            <i class="align-middle" :data-feather="item.icon"></i>
            <span class="align-middle">{{ item.name }}</span>
          </router-link>
        </li>

        <li class="sidebar-header">Ferramentas & Componentes</li>
        <li
          v-for="item in sections[1].items"
          :key="item.name"
          :class="['sidebar-item', { active: $route.path === item.path }]"
        >
          <router-link :to="item.path" class="sidebar-link">
            <i class="align-middle" :data-feather="item.icon"></i>
            <span class="align-middle">{{ item.name }}</span>
          </router-link>
        </li>

        <li class="sidebar-header">Plugins & Addons</li>
        <li
          v-for="item in sections[2].items"
          :key="item.name"
          :class="['sidebar-item', { active: $route.path === item.path }]"
        >
          <router-link :to="item.path" class="sidebar-link">
            <i class="align-middle" :data-feather="item.icon"></i>
            <span class="align-middle">{{ item.name }}</span>
          </router-link>
        </li>
      </ul>

      <div class="sidebar-cta">
        <div class="sidebar-cta-content">
          <strong class="d-inline-block mb-2">Upgrade to Pro</strong>
          <div class="mb-3 text-sm">
            Quer mais componentes? Veja nossa versão premium.
          </div>
          <div class="d-grid">
            <router-link to="/upgrade" class="btn btn-primary"
              >Upgrade to Pro</router-link
            >
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent } from "vue";
//   import feather from 'feather-icons'

interface MenuItem {
  name: string;
  path: string;
  icon: string;
}

interface MenuSection {
  header: string;
  items: MenuItem[];
}

export default defineComponent({
  name: "Sidebar",
  data() {
    return {
      sections: [
        {
          header: "Páginas",
          items: [
            { name: "Dashboard", path: "/", icon: "sliders" },
            { name: "Profile", path: "/profile", icon: "user" },
            { name: "Sign In", path: "/sign-in", icon: "log-in" },
            { name: "Sign Up", path: "/sign-up", icon: "user-plus" },
            { name: "Blank", path: "/blank", icon: "book" },
          ],
        },
        {
          header: "Ferramentas & Componentes",
          items: [
            { name: "Buttons", path: "/ui/buttons", icon: "square" },
            { name: "Forms", path: "/ui/forms", icon: "check-square" },
            { name: "Cards", path: "/ui/cards", icon: "grid" },
            { name: "Typography", path: "/ui/typography", icon: "align-left" },
            { name: "Icons", path: "/ui/icons", icon: "coffee" },
          ],
        },
        {
          header: "Plugins & Addons",
          items: [
            { name: "Charts", path: "/plugins/charts", icon: "bar-chart-2" },
            { name: "Maps", path: "/plugins/maps", icon: "map" },
          ],
        },
      ] as MenuSection[],
    };
  },
  mounted() {
    //   feather.replace()
  },
});
</script>

<style scoped>
@import "@/assets/css/app.css";
</style>
