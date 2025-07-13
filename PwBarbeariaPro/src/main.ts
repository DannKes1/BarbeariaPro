import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import "@/assets/css/app.css";
import "bootstrap";

import "bootstrap/dist/js/bootstrap.bundle";
import "simplebar";
import "simplebar/dist/simplebar.css";
import "@/assets/js/app";

import "sweetalert2/dist/sweetalert2.min.css";

import feather from "feather-icons";

const app = createApp(App);

app.config.globalProperties.$cookieDefaults = {
  secure: import.meta.env.PROD,
  sameSite: "Strict",
  path: "/",
};

app.use(router);

app.mount("#app");

feather.replace();
