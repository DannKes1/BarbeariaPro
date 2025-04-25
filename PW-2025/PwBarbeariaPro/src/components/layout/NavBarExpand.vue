<template>
  <!-- src/components/Sidebar.vue -->
  <template>
    <nav id="sidebar" class="sidebar js-sidebar">
      <div class="sidebar-content js-simplebar">
        <!-- Marca / Logo -->
        <router-link class="sidebar-brand" to="/">
          <span class="align-middle">AdminKit</span>
        </router-link>

        <!-- Seções de navegação -->
        <ul class="sidebar-nav">
          <!-- Cabeçalho da seção “Páginas” -->
          <li class="sidebar-header">Páginas</li>
          <!-- Itera pelos itens da primeira seção -->
          <li
            v-for="item in sections[0].items"
            :key="item.name"
            :class="['sidebar-item', { active: route.path === item.path }]"
          >
            <router-link :to="item.path" class="sidebar-link">
              <i class="align-middle" :data-feather="item.icon"></i>
              <span class="align-middle">{{ item.name }}</span>
            </router-link>
          </li>

          <!-- Cabeçalho da seção “Ferramentas & Componentes” -->
          <li class="sidebar-header">Ferramentas & Componentes</li>
          <li
            v-for="item in sections[1].items"
            :key="item.name"
            :class="['sidebar-item', { active: route.path === item.path }]"
          >
            <router-link :to="item.path" class="sidebar-link">
              <i class="align-middle" :data-feather="item.icon"></i>
              <span class="align-middle">{{ item.name }}</span>
            </router-link>
          </li>

          <!-- Cabeçalho da seção “Plugins & Addons” -->
          <li class="sidebar-header">Plugins & Addons</li>
          <li
            v-for="item in sections[2].items"
            :key="item.name"
            :class="['sidebar-item', { active: route.path === item.path }]"
          >
            <router-link :to="item.path" class="sidebar-link">
              <i class="align-middle" :data-feather="item.icon"></i>
              <span class="align-middle">{{ item.name }}</span>
            </router-link>
          </li>
        </ul>

        <!-- Botão de call-to-action -->
        <div class="sidebar-cta">
          <div class="sidebar-cta-content">
            <strong class="d-inline-block mb-2">Upgrade to Pro</strong>
            <div class="mb-3 text-sm">Quer mais componentes? Veja nossa versão premium.</div>
            <div class="d-grid">
              <router-link to="/upgrade" class="btn btn-primary">Upgrade to Pro</router-link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </template>

  <script setup>
    // Importa utilitários do Vue
    import { onMounted } from 'vue'
    import { useRoute } from 'vue-router'
    // Feather-icons para substituir os ícones <i data-feather="...">
    import feather from 'feather-icons'

    // Captura a rota ativa para destacar o menu ativo
    const route = useRoute()

    // Tudo que vai dentro do menu, dividido em 3 seções
    const sections = [
      {
        header: 'Páginas',
        items: [
          { name: 'Dashboard', path: '/', icon: 'sliders' },
          { name: 'Profile', path: '/profile', icon: 'user' },
          { name: 'Sign In', path: '/sign-in', icon: 'log-in' },
          { name: 'Sign Up', path: '/sign-up', icon: 'user-plus' },
          { name: 'Blank', path: '/blank', icon: 'book' },
        ],
      },
      {
        header: 'Ferramentas & Componentes',
        items: [
          { name: 'Buttons', path: '/ui/buttons', icon: 'square' },
          { name: 'Forms', path: '/ui/forms', icon: 'check-square' },
          { name: 'Cards', path: '/ui/cards', icon: 'grid' },
          { name: 'Typography', path: '/ui/typography', icon: 'align-left' },
          { name: 'Icons', path: '/ui/icons', icon: 'coffee' },
        ],
      },
      {
        header: 'Plugins & Addons',
        items: [
          { name: 'Charts', path: '/plugins/charts', icon: 'bar-chart-2' },
          { name: 'Maps', path: '/plugins/maps', icon: 'map' },
        ],
      },
    ]

    // Ao montar, substitui todos os <i data-feather> pelos SVGs
    onMounted(() => {
      feather.replace()
    })
  </script>

  <style scoped>
    /* Importa o CSS do AdminKit (ajuste o caminho se necessário) */
    @import '@/assets/css/app.css';
  </style>
</template>

<script lang="ts">
import type { defineComponent } from 'vue'

export default defineComponent({
  name: 'NavBarExpand',
})
</script>
