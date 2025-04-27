// src/router/index.ts
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
          path: "", // rota “/”
          name: "dashboard",
          component: () => import("@/views/DashboardView.vue"),
        },
        {
          path: "profile", // rota “/profile”
          name: "profile",
          component: () => import("@/views/ProfileView.vue"),
        },
        {
          path: "sign-in", // rota “/sign-in”
          name: "sign-in",
          component: () => import("@/views/SignInView.vue"),
        },
        {
          path: "sign-up", // rota “/sign-up”
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

        // …outras rotas filhas
      ],
    },
  ],
});

export default router;
