import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import "@/assets/css/app.css";
import "bootstrap";

import "bootstrap/dist/js/bootstrap.bundle"; // bootstrap JS (dropdowns, collapse etc)
import "simplebar"; // plugin de scroll customizado
import "simplebar/dist/simplebar.css"; // estilos do SimpleBar
import "@/assets/js/app"; // aqui vem a lógica de sidebar toggle

// Importe os ícones
// import feather from 'feather-icons'
import feather from "feather-icons";

const app = createApp(App);

app.use(router);

app.mount("#app");

feather.replace();
