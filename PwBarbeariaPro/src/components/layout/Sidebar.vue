<template>
  <nav id="sidebar" class="sidebar js-sidebar">
    <div class="sidebar-content js-simplebar">
      <router-link class="sidebar-brand" to="/">
        <span class="align-middle">BarbeariaPro</span>
      </router-link>

      <ul class="sidebar-nav">
        <template v-for="section in sections" :key="section.header">
          <li class="sidebar-header clickable" @click="toggleSection(section)">
            {{ section.header }}
            <i
              class="float-right"
              :data-feather="
                section.expanded ? 'chevron-down' : 'chevron-right'
              "
            ></i>
          </li>
          <transition name="fade">
            <div v-show="section.expanded">
              <li
                v-for="item in section.items"
                :key="item.name"
                :class="['sidebar-item', { active: $route.path === item.path }]"
              >
                <router-link :to="item.path" class="sidebar-link">
                  <i class="align-middle" :data-feather="item.icon"></i>
                  <span class="align-middle">{{ item.name }}</span>
                </router-link>
              </li>
            </div>
          </transition>
        </template>
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
  expanded: boolean;
}

export default defineComponent({
  name: "Sidebar",
  data() {
    return {
      sections: [
        {
          header: "Geral",
          expanded: true,
          items: [
            { name: "Dashboard", path: "/", icon: "sliders" },
            { name: "Profile", path: "/profile", icon: "user" },
            { name: "Blank", path: "/blank", icon: "book" },
          ],
        },
        {
          header: "Clientes e Profissionais",
          expanded: false,
          items: [
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
          ],
        },
        {
          header: "Serviços e Agendamentos",
          expanded: false,
          items: [
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
          ],
        },
        {
          header: "Financeiro",
          expanded: false,
          items: [
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
          header: "Caixa",
          expanded: false,
          items: [
            { name: "Abrir Caixa", path: "/caixa/abrir", icon: "play-circle" },
            {
              name: "Registrar Entrada",
              path: "/caixa/entrada",
              icon: "arrow-down-circle",
            },
            {
              name: "Registrar Saída",
              path: "/caixa/saida",
              icon: "arrow-up-circle",
            },
            { name: "Fechar Caixa", path: "/caixa/fechar", icon: "lock" },
            {
              name: "Consultar Caixa",
              path: "/caixa/consulta",
              icon: "archive",
            },
            {
              name: "Consultar Extrato",
              path: "/caixa/extrato",
              icon: "file-text",
            },
            {
              name: "Sangria de Caixa",
              path: "/caixa/sangria",
              icon: "corner-down-left",
            },
          ],
        },
        {
          header: "Extras",
          expanded: false,
          items: [
            { name: "Charts", path: "/plugins/charts", icon: "bar-chart-2" },
            { name: "Maps", path: "/plugins/maps", icon: "map" },
            { name: "Icons", path: "/ui/icons", icon: "coffee" },
          ],
        },
      ] as MenuSection[],
    };
  },
  methods: {
    toggleSection(section: MenuSection) {
      section.expanded = !section.expanded;
      this.$nextTick(() => feather.replace());
    },
  },
  mounted() {
    feather.replace();
  },
});
</script>

<style scoped>
@import "@/assets/css/app.css";

#sidebar {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 1rem;
}

.sidebar-nav {
  padding-bottom: 2rem;
}

.sidebar-header {
  padding: 1rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #9ca3af;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-item {
  list-style: none;
}

.sidebar-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: #e5e7eb;
  text-decoration: none;
}

.sidebar-link:hover {
  background-color: #374151;
  color: white;
}

.sidebar-item.active .sidebar-link {
  background-color: #4f46e5;
  color: white;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  max-height: 0;
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  max-height: 1000px;
}
</style>
