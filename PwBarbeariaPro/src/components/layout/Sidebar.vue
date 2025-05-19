<template>
  <nav id="sidebar" class="sidebar js-sidebar">
    <div class="sidebar-content js-simplebar">
      <router-link class="sidebar-brand" to="/">
        <span class="align-middle">BarbeariaPro</span>
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
      </ul>
    </div>
  </nav>
</template>

<script lang="ts">
import feather from "feather-icons";
import { defineComponent } from "vue";

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
            { name: "Blank", path: "/blank", icon: "book" },
            {
              name: "Cadastrar Cliente",
              path: "/cliente/cadastro",
              icon: "user-plus",
            },
            {
              name: "Consultar Cliente",
              path: "/cliente/consulta",
              icon: "search",
            },
            {
              name: "Cadastrar Profissional",
              path: "/profissional/cadastro",
              icon: "user-check",
            },
            {
              name: "Consultar Profissional",
              path: "/profissional/consulta",
              icon: "search",
            },
            {
              name: "Cadastrar Serviço",
              path: "/servico/cadastro",
              icon: "plus-square",
            },

            {
              name: "Consultar Serviço",
              path: "/servico/consulta",
              icon: "search",
            },
            {
              name: "Agendar",
              path: "/agendamento/cadastro",
              icon: "calendar",
            },

            {
              name: "Consultar Agendamento",
              path: "/agendamento/consulta",
              icon: "search",
            },
            {
              name: "Cadastrar Pagamento",
              path: "/pagamento/cadastro",
              icon: "dollar-sign",
            },
            {
              name: "Consultar Pagamento",
              path: "/pagamento/consulta",
              icon: "dollar-sign",
            },
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
    feather.replace();
  },
});
</script>

<style scoped>
@import "@/assets/css/app.css";
</style>
