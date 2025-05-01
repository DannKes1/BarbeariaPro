import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import "@/assets/css/app.css";
import "bootstrap";

import "bootstrap/dist/js/bootstrap.bundle"; 
import "simplebar"; 
import "simplebar/dist/simplebar.css"; 
import "@/assets/js/app"; 


import feather from "feather-icons";

const app = createApp(App);

app.use(router);

app.mount("#app");

feather.replace();
