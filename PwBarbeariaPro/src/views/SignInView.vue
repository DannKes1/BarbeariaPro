<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
   
      <div>
        <div
          class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100"
        >
          <i class="feather-icon text-primary-600" data-feather="scissors"></i>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Barbearia Pro
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Faça login em sua conta
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">E-mail</label>
            <input
              id="email"
              v-model="loginForm.email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="E-mail"
              :disabled="isLoading"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Senha</label>
            <div class="relative">
              <input
                id="password"
                v-model="loginForm.password"
                :type="showPassword ? 'text' : 'password'"
                name="password"
                autocomplete="current-password"
                required
                class="appearance-none rounded-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Senha"
                :disabled="isLoading"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                @click="showPassword = !showPassword"
                :disabled="isLoading"
              >
                <i
                  class="feather-icon text-gray-400 hover:text-gray-600"
                  :data-feather="showPassword ? 'eye-off' : 'eye'"
                ></i>
              </button>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              v-model="loginForm.rememberMe"
              name="remember-me"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              :disabled="isLoading"
            />
            <label for="remember-me" class="ml-2 block text-sm text-gray-900">
              Lembrar-me
            </label>
          </div>

          <div class="text-sm">
            <a
              href="#"
              class="font-medium text-primary-600 hover:text-primary-500"
              @click.prevent="handleForgotPassword"
            >
              Esqueceu a senha?
            </a>
          </div>
        </div>

        
        <div>
          <button
            type="submit"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="isLoading || !isFormValid"
          >
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <i
                v-if="!isLoading"
                class="feather-icon text-primary-500 group-hover:text-primary-400"
                data-feather="log-in"
              ></i>
              <div
                v-else
                class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"
              ></div>
            </span>
            {{ isLoading ? "Entrando..." : "Entrar" }}
          </button>
        </div>

        <div class="text-center">
          <span class="text-sm text-gray-600">
            Não tem uma conta?
            <router-link
              to="/sign-up"
              class="font-medium text-primary-600 hover:text-primary-500"
            >
              Cadastre-se
            </router-link>
          </span>
        </div>
      </form>

    
      <div v-if="errorMessage" class="mt-4 p-3 bg-red-50 rounded-md">
        <div class="flex items-center">
          <i
            class="feather-icon text-red-400 mr-2"
            data-feather="alert-circle"
          ></i>
          <div class="text-sm">
            <p class="text-red-800 font-medium">Erro no login</p>
            <p class="text-red-600">{{ errorMessage }}</p>
          </div>
        </div>
      </div>

      <div class="mt-4 text-center">
        <button
          @click="showPrivacySettings = !showPrivacySettings"
          class="text-xs text-gray-500 hover:text-gray-700"
        >
          <i class="feather-icon mr-1" data-feather="shield"></i>
          Configurações de Privacidade
        </button>
      </div>

      <div v-if="showPrivacySettings" class="mt-4 p-4 bg-gray-50 rounded-md">
        <h4 class="text-sm font-medium text-gray-900 mb-3">
          Configurações de Privacidade
        </h4>

        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm text-gray-700"
                >Lembrar dados de login</label
              >
              <p class="text-xs text-gray-500">
                Salvar e-mail para próximos logins
              </p>
            </div>
            <input
              v-model="privacySettings.rememberLogin"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>

          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm text-gray-700"
                >Redirecionamento automático</label
              >
              <p class="text-xs text-gray-500">
                Voltar para a última página visitada
              </p>
            </div>
            <input
              v-model="privacySettings.autoRedirect"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>

          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm text-gray-700">Manter sessão ativa</label>
              <p class="text-xs text-gray-500">Não fazer logout automático</p>
            </div>
            <input
              v-model="privacySettings.keepSession"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>
        </div>

        <div class="mt-4 flex justify-end space-x-2">
          <button
            @click="showPrivacySettings = false"
            class="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancelar
          </button>
          <button
            @click="savePrivacySettings"
            class="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useCookies } from "@/composables/useCookies";
import { useSweetAlert } from "@/composables/useSweetAlert";
import { api } from "@/common/http";


interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface PrivacySettings {
  rememberLogin: boolean;
  autoRedirect: boolean;
  keepSession: boolean;
}

interface Usuario {
  id: number;
  email: string;
  perfil: string;
  senha: string;
  isAdmin: boolean;
  profissionalId?: number;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  perfil: string;
  isAdmin: boolean;
  profissionalId?: number;
}


const router = useRouter();
const route = useRoute();
const { useCookieState, COOKIE_CONFIGS, hasConsentForCategory } = useCookies();
const { showToast, showError, showSuccess } = useSweetAlert();


const isLoading = ref(false);
const showPassword = ref(false);
const showPrivacySettings = ref(false);
const errorMessage = ref("");
const usuariosAPI = ref<Usuario[]>([]);


const loginForm = reactive<LoginForm>({
  email: "",
  password: "",
  rememberMe: false,
});


const privacySettings = reactive<PrivacySettings>({
  rememberLogin: true,
  autoRedirect: true,
  keepSession: false,
});


const isFormValid = computed(() => {
  return (
    loginForm.email.trim() &&
    loginForm.password.trim() &&
    loginForm.email.includes("@")
  );
});

const cookiesEnabled = computed(() => {
  return typeof document !== "undefined" && navigator.cookieEnabled;
});

const rememberedUser = computed(() => {
  return useCookieState(COOKIE_CONFIGS.REMEMBER_USER).value;
});

const lastRoute = computed(() => {
  return route.query.redirect as string;
});

const isDevelopment = computed(() => {
  return process.env.NODE_ENV === "development";
});


async function buscarUsuarios(): Promise<Usuario[]> {
  try {
    console.log("🔍 Buscando usuários na API...");
    const response = await api.get("/api/Usuario");
    const usuarios: Usuario[] = response.data;

    console.log("👥 Usuários encontrados:", usuarios.length);
    console.log("📋 Lista de usuários:", usuarios);

    usuariosAPI.value = usuarios;
    return usuarios;
  } catch (error) {
    console.error("❌ Erro ao buscar usuários:", error);
    throw new Error("Erro ao conectar com o servidor");
  }
}

async function validarCredenciais(
  email: string,
  senha: string
): Promise<Usuario | null> {
  try {
    const usuarios = await buscarUsuarios();

    console.log("🔐 Validando credenciais para:", email);

   
    const usuario = usuarios.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!usuario) {
      console.log("❌ Usuário não encontrado");
      return null;
    }

    console.log("👤 Usuário encontrado:", {
      id: usuario.id,
      email: usuario.email,
      perfil: usuario.perfil,
      isAdmin: usuario.isAdmin,
    });

   
    if (usuario.senha === senha) {
      console.log("✅ Senha válida");
      return usuario;
    } else {
      console.log("❌ Senha inválida");
      return null;
    }
  } catch (error) {
    console.error("❌ Erro na validação:", error);
    throw error;
  }
}


const saveRememberedUser = (userData: UserData) => {
  if (loginForm.rememberMe && hasConsentForCategory("preferences")) {
    const rememberedData = {
      email: userData.email,
      name: userData.name,
      lastLogin: new Date().toISOString(),
    };
    useCookieState(COOKIE_CONFIGS.REMEMBER_USER).setValue(rememberedData);
  }
};

const clearRememberedUser = () => {
  useCookieState(COOKIE_CONFIGS.REMEMBER_USER).setValue(null);
};

const checkExistingLogin = async () => {
  const token = useCookieState(COOKIE_CONFIGS.AUTH_TOKEN).value;
  const userData = useCookieState(COOKIE_CONFIGS.USER_DATA).value;

  if (token && userData) {
    const shouldRedirect = await showToast.confirm(
      "Já logado",
      "Você já está logado. Deseja ir para o dashboard?",
      "Sim, ir para dashboard"
    );

    if (shouldRedirect) {
      router.push("/dashboard");
    }
  }
};

const handleLogin = async () => {
  if (!isFormValid.value) {
    errorMessage.value = "Por favor, preencha todos os campos corretamente.";
    return;
  }

  try {
    isLoading.value = true;
    errorMessage.value = "";

    console.log("🚀 Iniciando processo de login...");

    const usuario = await validarCredenciais(
      loginForm.email,
      loginForm.password
    );

    if (!usuario) {
      throw new Error("E-mail ou senha incorretos");
    }

   
    const userData: UserData = {
      id: usuario.id,
      name: usuario.perfil || "Usuário",
      email: usuario.email,
      role: usuario.isAdmin ? "admin" : "user",
      perfil: usuario.perfil,
      isAdmin: usuario.isAdmin,
      profissionalId: usuario.profissionalId,
    };

    console.log("✅ Login bem-sucedido:", userData);

    
    const token = "jwt_token_" + Date.now() + "_" + usuario.id;


    useCookieState(COOKIE_CONFIGS.AUTH_TOKEN).setValue(token);
    useCookieState(COOKIE_CONFIGS.USER_DATA).setValue(userData);

 
    saveRememberedUser(userData);

   
    const redirectTo = (route.query.redirect as string) || "/dashboard";

   
    showSuccess("Login realizado!", `Bem-vindo, ${userData.name}!`);

 
    await nextTick(() => {
      setTimeout(() => {
        router.push(redirectTo);
      }, 1000);
    });
  } catch (error: any) {
    console.error("❌ Erro no login:", error);

    if (error.message === "Erro ao conectar com o servidor") {
      errorMessage.value =
        "Não foi possível conectar ao servidor. Tente novamente.";
    } else {
      errorMessage.value =
        error.message || "E-mail ou senha incorretos. Tente novamente.";
    }

    showError("Erro no login", errorMessage.value);
  } finally {
    isLoading.value = false;
  }
};

const handleForgotPassword = async () => {
  const { value: email } = await showToast.inputEmail(
    "Recuperar senha",
    "Digite seu e-mail para receber as instruções de recuperação:"
  );

  if (email) {
    try {
     
      const usuarios = await buscarUsuarios();
      const usuario = usuarios.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );

      if (usuario) {
        showSuccess(
          "E-mail enviado!",
          "Instruções de recuperação foram enviadas para seu e-mail."
        );
      } else {
        showError(
          "E-mail não encontrado",
          "Este e-mail não está cadastrado no sistema."
        );
      }
    } catch (error) {
      showError(
        "Erro",
        "Não foi possível processar a solicitação. Tente novamente."
      );
    }
  }
};

const savePrivacySettings = () => {
  
  localStorage.setItem("privacySettings", JSON.stringify(privacySettings));
  showPrivacySettings.value = false;
  showToast.success("Configurações salvas com sucesso!");
};

onMounted(async () => {
 
  const savedSettings = localStorage.getItem("privacySettings");
  if (savedSettings) {
    Object.assign(privacySettings, JSON.parse(savedSettings));
  }

  
  await checkExistingLogin();

  
  try {
    await buscarUsuarios();
  } catch (error) {
    console.warn("Não foi possível pré-carregar usuários:", error);
  }

  if (rememberedUser.value && privacySettings.rememberLogin) {
    loginForm.email = rememberedUser.value.email;
  }
});
</script>

<style scoped>
.feather-icon {
  width: 16px;
  height: 16px;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.primary-100 {
  background-color: #dbeafe;
}

.primary-600 {
  color: #2563eb;
}

.primary-500 {
  color: #3b82f6;
}

.bg-primary-600 {
  background-color: #2563eb;
}

.bg-primary-700 {
  background-color: #1d4ed8;
}

.hover\:bg-primary-700:hover {
  background-color: #1d4ed8;
}

.text-primary-600 {
  color: #2563eb;
}

.text-primary-500 {
  color: #3b82f6;
}

.hover\:text-primary-500:hover {
  color: #3b82f6;
}

.focus\:ring-primary-500:focus {
  --tw-ring-color: #3b82f6;
}

.focus\:border-primary-500:focus {
  border-color: #3b82f6;
}

.border-primary-500 {
  border-color: #3b82f6;
}

/* Estilos para elementos de formulário */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.appearance-none {
  appearance: none;
}

.rounded-none {
  border-radius: 0;
}

.rounded-t-md {
  border-top-left-radius: 0.375rem;
  border-top-right-radius: 0.375rem;
}

.rounded-b-md {
  border-bottom-left-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
}

.focus\:outline-none:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.focus\:ring-2:focus {
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0
    var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0
    calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow:
    var(--tw-ring-offset-shadow), var(--tw-ring-shadow),
    var(--tw-shadow, 0 0 #0000);
}

.focus\:ring-offset-2:focus {
  --tw-ring-offset-width: 2px;
}

.disabled\:opacity-50:disabled {
  opacity: 0.5;
}

.disabled\:cursor-not-allowed:disabled {
  cursor: not-allowed;
}

.group:hover .group-hover\:text-primary-400 {
  color: #60a5fa;
}

/* Estilos para layout */
.min-h-screen {
  min-height: 100vh;
}

.max-w-md {
  max-width: 28rem;
}

.space-y-8 > :not([hidden]) ~ :not([hidden]) {
  --tw-space-y-reverse: 0;
  margin-top: calc(2rem * calc(1 - var(--tw-space-y-reverse)));
  margin-bottom: calc(2rem * var(--tw-space-y-reverse));
}

.space-y-6 > :not([hidden]) ~ :not([hidden]) {
  --tw-space-y-reverse: 0;
  margin-top: calc(1.5rem * calc(1 - var(--tw-space-y-reverse)));
  margin-bottom: calc(1.5rem * var(--tw-space-y-reverse));
}

.space-y-3 > :not([hidden]) ~ :not([hidden]) {
  --tw-space-y-reverse: 0;
  margin-top: calc(0.75rem * calc(1 - var(--tw-space-y-reverse)));
  margin-bottom: calc(0.75rem * var(--tw-space-y-reverse));
}

.space-x-2 > :not([hidden]) ~ :not([hidden]) {
  --tw-space-x-reverse: 0;
  margin-right: calc(0.5rem * var(--tw-space-x-reverse));
  margin-left: calc(0.5rem * calc(1 - var(--tw-space-x-reverse)));
}

.-space-y-px > :not([hidden]) ~ :not([hidden]) {
  --tw-space-y-reverse: 0;
  margin-top: calc(-1px * calc(1 - var(--tw-space-y-reverse)));
  margin-bottom: calc(-1px * var(--tw-space-y-reverse));
}

/* Cores e backgrounds */
.bg-gray-50 {
  background-color: #f9fafb;
}

.bg-blue-50 {
  background-color: #eff6ff;
}

.bg-yellow-50 {
  background-color: #fefce8;
}

.bg-red-50 {
  background-color: #fef2f2;
}

.text-gray-900 {
  color: #111827;
}

.text-gray-600 {
  color: #4b5563;
}

.text-gray-500 {
  color: #6b7280;
}

.text-gray-700 {
  color: #374151;
}

.text-gray-800 {
  color: #1f2937;
}

.text-blue-400 {
  color: #60a5fa;
}

.text-blue-600 {
  color: #2563eb;
}

.text-blue-800 {
  color: #1e40af;
}

.text-red-400 {
  color: #f87171;
}

.text-red-600 {
  color: #dc2626;
}

.text-red-800 {
  color: #991b1b;
}

.hover\:text-gray-600:hover {
  color: #4b5563;
}

.hover\:text-gray-700:hover {
  color: #374151;
}

.hover\:text-blue-600:hover {
  color: #2563eb;
}

/* Bordas */
.border {
  border-width: 1px;
}

.border-transparent {
  border-color: transparent;
}

.border-gray-300 {
  border-color: #d1d5db;
}

.rounded {
  border-radius: 0.25rem;
}

.rounded-md {
  border-radius: 0.375rem;
}

.rounded-full {
  border-radius: 9999px;
}

/* Posicionamento */
.relative {
  position: relative;
}

.absolute {
  position: absolute;
}

.inset-y-0 {
  top: 0;
  bottom: 0;
}

.left-0 {
  left: 0;
}

.right-0 {
  right: 0;
}

/* Flexbox */
.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.justify-end {
  justify-content: flex-end;
}

/* Dimensões */
.w-full {
  width: 100%;
}

.h-4 {
  height: 1rem;
}

.w-4 {
  width: 1rem;
}

.h-12 {
  height: 3rem;
}

.w-12 {
  width: 3rem;
}

/* Padding e margin */
.p-3 {
  padding: 0.75rem;
}

.p-4 {
  padding: 1rem;
}

.px-3 {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.py-1 {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.py-12 {
  padding-top: 3rem;
  padding-bottom: 3rem;
}

.pr-3 {
  padding-right: 0.75rem;
}

.pr-10 {
  padding-right: 2.5rem;
}

.pl-3 {
  padding-left: 0.75rem;
}

.ml-2 {
  margin-left: 0.5rem;
}

.ml-auto {
  margin-left: auto;
}

.mr-1 {
  margin-right: 0.25rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mt-4 {
  margin-top: 1rem;
}

.mt-6 {
  margin-top: 1.5rem;
}

.mt-8 {
  margin-top: 2rem;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

/* Tipografia */
.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-3xl {
  font-size: 1.875rem;
  line-height: 2.25rem;
}

.font-medium {
  font-weight: 500;
}

.font-extrabold {
  font-weight: 800;
}

.text-center {
  text-align: center;
}

/* Z-index */
.z-10 {
  z-index: 10;
}

/* Outros */
.block {
  display: block;
}

.placeholder-gray-500::placeholder {
  color: #6b7280;
}

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
</style>
