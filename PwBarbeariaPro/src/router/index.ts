import { createRouter, createWebHistory } from "vue-router";
import Layout from "@/components/layout/Layout.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/login",
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
    {
      path: "/app",
      component: Layout,
      children: [
        {
          path: "/dashboard",
          name: "dashboard",
          component: () => import("@/views/DashboardView.vue"),
        },
        {
          path: "/profile",
          name: "profile",
          component: () => import("@/views/ProfileView.vue"),
        },
        {
          path: "/icons",
          name: "IconsFeather",
          component: () => import("@/views/IconsFeatherView.vue"),
        },
        {
          path: "/cliente/cadastro",
          name: "cliente-cadastro",
          component: () => import("@/views/ClienteCadastroView.vue"),
        },
        {
          path: "/cliente/consulta",
          name: "cliente-consulta",
          component: () => import("@/views/ClienteConsultaView.vue"),
        },
        {
          path: "/cliente/editar/:id",
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
        {
          path: "/servico/cadastro",
          name: "servico-cadastro",
          component: () => import("@/views/ServicoCadastroView.vue"),
        },
        {
          path: "/servico/consulta",
          name: "servico-consulta",
          component: () => import("@/views/ServicoConsultaView.vue"),
        },
        {
          path: "/servico/editar/:nome",
          name: "servico-editar",
          component: () => import("@/views/ServicoEditarView.vue"),
        },
        {
          path: "/agendamento/cadastro",
          name: "AgendamentoCadastro",
          component: () => import("@/views/AgendamentoCadastroView.vue"),
        },
        {
          path: "/agendamento/consulta",
          name: "agendamento-consulta",
          component: () => import("@/views/AgendamentoConsultaView.vue"),
        },
        {
          path: "/agendamento/editar/:id",
          name: "agendamento-editar",
          component: () => import("@/views/AgendamentoEditarView.vue"),
        },
        {
          path: "/pagamento/cadastro",
          name: "pagamento-cadastro",
          component: () => import("@/views/PagamentoCadastroView.vue"),
        },
        {
          path: "/pagamento/editar/:id",
          name: "pagamento-editar",
          component: () => import("@/views/PagamentoEditarView.vue"),
        },
        {
          path: "/pagamento/consulta",
          name: "pagamento-consulta",
          component: () => import("@/views/PagamentoConsultaView.vue"),
        },
        {
          path: "/caixa/abrir",
          name: "caixa-abrir",
          component: () => import("@/views/AbrirCaixaView.vue"),
        },
        {
          path: "/caixa/entrada",
          name: "caixa-entrada",
          component: () => import("@/views/RegistrarEntradaView.vue"),
        },
        {
          path: "/caixa/saida",
          name: "caixa-saida",
          component: () => import("@/views/RegistrarSaidaView.vue"),
        },
        {
          path: "/caixa/fechar",
          name: "caixa-fechar",
          component: () => import("@/views/FecharCaixaView.vue"),
        },
        {
          path: "/caixa/extrato",
          name: "caixa-extrato",
          component: () => import("@/views/ExtratoCaixaConsultaView.vue"),
        },
        {
          path: "/caixa/sangria",
          name: "caixa-sangria",
          component: () => import("@/views/SangriaCaixaView.vue"),
        },
        {
          path: "/caixa/consulta",
          name: "caixa-consulta",
          component: () => import("@/views/CaixaConsultaView.vue"),
        },
      ],
    },
  ],
});

export default router;
