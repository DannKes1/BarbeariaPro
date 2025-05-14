import { createRouter, createWebHistory } from "vue-router";
import Layout from "@/components/layout/Layout.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: Layout,
      children: [
        {
          path: "",
          name: "dashboard",
          component: () => import("@/views/DashboardView.vue"),
        },
        {
          path: "profile",
          name: "profile",
          component: () => import("@/views/ProfileView.vue"),
        },
        {
          path: "sign-in",
          name: "sign-in",
          component: () => import("@/views/SignInView.vue"),
        },
        {
          path: "sign-up",
          name: "sign-up",
          component: () => import("@/views/SignUpView.vue"),
        },
        {
          path: "icons",
          name: "IconsFeather",
          component: () => import("@/views/IconsFeatherView.vue"),
        },

        {
          path: "blank",
          name: "blank",
          component: () => import("@/views/BlankPageView.vue"),
        },
        {
          path: "cliente/cadastro",
          name: "cliente-cadastro",
          component: () => import("@/views/ClienteCadastroView.vue"),
        },
        {
          path: "/cliente/consulta",
          name: "cliente-consulta",
          component: () => import("@/views/ClienteConsultaView.vue"),
        },
        {
          path: "/cliente/editar/:cpf",
          name: "cliente-editar",
          component: () => import("@/views/ClienteEditarView.vue"),
        },
        {
          path: "/profissional/cadastro",
          name: "profissional-cadastro",
          component: () => import("@/views/ProfissionalCadastroView.vue"),
        },

        {
          path: "/profissional/consulta",
          name: "profissional-consulta",
          component: () => import("@/views/ProfissionalConsultaView.vue"),
        },

        {
          path: "/profissional/editar/:cpf",
          name: "profissional-editar",
          component: () => import("@/views/ProfissionalEditarView.vue"),
        },
      ],
    },
    {
      path: "/login",
      name: "sign-in",
      component: () => import("@/views/SignInView.vue"),
    },
    {
      path: "/sign-up",
      name: "sign-up",
      component: () => import("@/views/SignUpView.vue"),
    },
  ],
});

export default router;
