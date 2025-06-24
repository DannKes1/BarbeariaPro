<template>
  <main class="d-flex w-100">
    <div class="container d-flex flex-column">
      <div class="row vh-100">
        <div class="col-sm-10 col-md-8 col-lg-6 mx-auto d-table h-100">
          <div class="d-table-cell align-middle">
            <div class="text-center mt-4">
              <h1 class="h2">Welcome back, Charles</h1>
              <p class="lead">Sign in to your account to continue</p>
            </div>

            <div class="card">
              <div class="card-body">
                <div class="m-sm-4">
                  <div class="text-center">
                    <img
                      src="@/assets/img/avatars/avatar.jpg"
                      alt="Charles Hall"
                      class="img-fluid rounded-circle"
                      width="132"
                      height="132"
                    />
                  </div>
                  <form @submit.prevent="handleSignIn">
                    <div class="mb-3">
                      <label class="form-label">Email</label>
                      <input
                        v-model="form.email"
                        class="form-control form-control-lg"
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        required
                        :disabled="isLoading"
                      />
                    </div>
                    <div class="mb-3">
                      <label class="form-label">Password</label>
                      <input
                        v-model="form.password"
                        class="form-control form-control-lg"
                        type="password"
                        name="password"
                        placeholder="Enter your password"
                        required
                        :disabled="isLoading"
                      />
                      <small>
                        <a href="#" @click.prevent="handleForgotPassword"
                          >Forgot password?</a
                        >
                      </small>
                    </div>
                    <div>
                      <label class="form-check">
                        <input
                          v-model="form.rememberMe"
                          class="form-check-input"
                          type="checkbox"
                          value="remember-me"
                        />
                        <span class="form-check-label">
                          Remember me next time
                        </span>
                      </label>
                    </div>
                    <div class="text-center mt-3">
                      <button
                        type="submit"
                        class="btn btn-lg btn-primary"
                        :disabled="isLoading"
                      >
                        <span
                          v-if="isLoading"
                          class="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        {{ isLoading ? "Signing in..." : "Sign in" }}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useSweetAlert } from "@/composables/useSweetAlert";

export default defineComponent({
  name: "SignInView",
  setup() {
    const router = useRouter();
    const { showToast, showError, showLoading, hideLoading, showInput } =
      useSweetAlert();

    const isLoading = ref(false);

    const form = reactive({
      email: "",
      password: "",
      rememberMe: false,
    });

    const handleSignIn = async () => {
      if (!form.email || !form.password) {
        showError("Campos obrigatórios", "Por favor, preencha email e senha.");
        return;
      }

      isLoading.value = true;
      showLoading("Fazendo login...");

      try {
        // Simular chamada de API
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Simular validação de credenciais
        if (
          form.email === "admin@barbeariapro.com" &&
          form.password === "123456"
        ) {
          hideLoading();
          showToast.success("Login realizado com sucesso!");

          // Salvar dados de sessão se "lembrar de mim" estiver marcado
          if (form.rememberMe) {
            localStorage.setItem("rememberUser", "true");
            localStorage.setItem("userEmail", form.email);
          }

          // Redirecionar para dashboard
          setTimeout(() => {
            router.push("/");
          }, 1000);
        } else {
          hideLoading();
          showError(
            "Credenciais inválidas",
            "Email ou senha incorretos. Tente novamente."
          );
        }
      } catch (error) {
        hideLoading();
        showError(
          "Erro no servidor",
          "Ocorreu um erro interno. Tente novamente mais tarde."
        );
      } finally {
        isLoading.value = false;
      }
    };

    const handleForgotPassword = async () => {
      const email = await showInput(
        "Recuperar senha",
        "Digite seu email para receber as instruções",
        "email"
      );

      if (email) {
        showLoading("Enviando email...");

        // Simular envio de email
        await new Promise((resolve) => setTimeout(resolve, 2000));

        hideLoading();
        showToast.success("Email de recuperação enviado!");
      }
    };

    return {
      form,
      isLoading,
      handleSignIn,
      handleForgotPassword,
    };
  },
});
</script>

<style scoped>
.card {
  border: none;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
</style>
