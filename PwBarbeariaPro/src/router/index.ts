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
      ],
    },
    {
      path: "/sign-in", 
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
