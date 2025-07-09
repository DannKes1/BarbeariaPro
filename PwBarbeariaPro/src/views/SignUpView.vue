<template>
  <main class="d-flex w-100">
    <div class="container d-flex flex-column">
      <div class="row vh-100">
        <div class="col-sm-10 col-md-8 col-lg-6 mx-auto d-table h-100">
          <div class="d-table-cell align-middle">
            <div class="text-center mt-4">
              <h1 class="h2">Get started</h1>
              <p class="lead">
                Start creating the best possible user experience for your
                customers.
              </p>
            </div>

            <div class="card">
              <div class="card-body">
                <div class="m-sm-4">
                  <form @submit.prevent="handleSignUp">
                   
                    <div class="mb-3">
                      <label class="form-label">Name</label>
                      <input
                        v-model="form.name"
                        class="form-control form-control-lg"
                        type="text"
                        name="name"
                        placeholder="Enter your name"
                        required
                        :disabled="isLoading"
                      />
                    </div>

                   
                    <div class="mb-3">
                      <label class="form-label">Company</label>
                      <input
                        v-model="form.company"
                        class="form-control form-control-lg"
                        type="text"
                        name="company"
                        placeholder="Enter your company name"
                        :disabled="isLoading"
                      />
                    </div>

              
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
                        placeholder="Enter password"
                        required
                        minlength="6"
                        :disabled="isLoading"
                      />
                      <small class="form-text text-muted">
                        Mínimo 6 caracteres
                      </small>
                    </div>

                   
                    <div class="mb-3">
                      <label class="form-label">Confirm Password</label>
                      <input
                        v-model="form.confirmPassword"
                        class="form-control form-control-lg"
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm your password"
                        required
                        :disabled="isLoading"
                      />
                    </div>

          
                    <div class="mb-3">
                      <label class="form-check">
                        <input
                          v-model="form.acceptTerms"
                          class="form-check-input"
                          type="checkbox"
                          required
                        />
                        <span class="form-check-label">
                          I agree to the
                          <a href="#" @click.prevent="showTerms"
                            >Terms and Conditions</a
                          >
                        </span>
                      </label>
                    </div>

                    <!-- Submit -->
                    <div class="text-center mt-3">
                      <button
                        type="submit"
                        class="btn btn-lg btn-primary"
                        :disabled="isLoading || !form.acceptTerms"
                      >
                        <span
                          v-if="isLoading"
                          class="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        {{ isLoading ? "Creating account..." : "Sign up" }}
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
import { defineComponent, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useSweetAlert } from "@/composables/useSweetAlert";


interface SignUpForm {
  name: string;
  company: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export default defineComponent({
  name: "SignUpView",
  setup() {
    const router = useRouter();
    const {
      showToast,
      showError,
      showSuccess,
      showLoading,
      hideLoading,
      confirmAction,
      Swal,
    } = useSweetAlert();

    const isLoading = ref(false);

    const form = reactive<SignUpForm>({
      name: "",
      company: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    });


    const resetForm = () => {
      form.name = "";
      form.company = "";
      form.email = "";
      form.password = "";
      form.confirmPassword = "";
      form.acceptTerms = false;
    };

    const validateForm = () => {
      if (!form.name.trim()) {
        showError("Campo obrigatório", "Por favor, informe seu nome.");
        return false;
      }
      if (!form.email.trim()) {
        showError("Campo obrigatório", "Por favor, informe seu email.");
        return false;
      }
      if (form.password.length < 6) {
        showError(
          "Senha muito curta",
          "A senha deve ter pelo menos 6 caracteres."
        );
        return false;
      }
      if (form.password !== form.confirmPassword) {
        showError(
          "Senhas não conferem",
          "As senhas informadas não são iguais."
        );
        return false;
      }
      if (!form.acceptTerms) {
        showError(
          "Termos obrigatórios",
          "Você deve aceitar os termos e condições."
        );
        return false;
      }
      return true;
    };

   
    const handleSignUp = async () => {
      if (!validateForm()) return;

      const confirmed = await confirmAction(
        "Confirmar cadastro",
        `Deseja criar uma conta para ${form.name}?`,
        "Sim, criar conta"
      );
      if (!confirmed) return;

      isLoading.value = true;
      showLoading("Criando sua conta...");

      try {
        
        await new Promise((resolve) => setTimeout(resolve, 3000));

        hideLoading();

        
        const result = await Swal.fire({
          title: "Conta criada com sucesso!",
          text: `Bem-vindo, ${form.name}! Sua conta foi criada.`,
          icon: "success",
          showCancelButton: true,
          confirmButtonText: "Fazer login agora",
          cancelButtonText: "Continuar cadastro",
          customClass: {
            confirmButton: "btn btn-primary me-2",
            cancelButton: "btn btn-outline-secondary",
          },
          buttonsStyling: false,
        });

        if (result.isConfirmed) {
          showToast.info("Redirecionando para login...");
          setTimeout(() => {
            router.push("/signin");
          }, 1000);
        } else {
          resetForm();
          showToast.info("Formulário limpo para novo cadastro");
        }
      } catch {
        hideLoading();
        showError(
          "Erro no servidor",
          "Ocorreu um erro ao criar sua conta. Tente novamente."
        );
      } finally {
        isLoading.value = false;
      }
    };

    const showTerms = () => {
      Swal.fire({
        title: "Termos e Condições",
        html: `
          <div class="text-start">
            <h6>1. Aceitação dos Termos</h6>
            <p>Ao usar nosso serviço, você concorda com estes termos.</p>
            <h6>2. Uso do Serviço</h6>
            <p>Você se compromete a usar o serviço de forma responsável.</p>
            <h6>3. Privacidade</h6>
            <p>Seus dados serão protegidos conforme nossa política de privacidade.</p>
            <h6>4. Responsabilidades</h6>
            <p>Você é responsável por manter suas credenciais seguras.</p>
          </div>
        `,
        confirmButtonText: "Entendi",
        customClass: { confirmButton: "btn btn-primary" },
        buttonsStyling: false,
        width: "600px",
      });
    };

    return {
      form,
      isLoading,
      handleSignUp,
      showTerms,
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
