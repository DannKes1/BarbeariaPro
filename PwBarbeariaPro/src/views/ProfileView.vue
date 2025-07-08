<template>
  <div class="p-6 max-w-4xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Meu Perfil</h1>
      <button class="btn-secondary" @click="logout">🚪 Sair</button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Foto e Informações Básicas -->
      <div class="col-span-1">
        <div class="card text-center">
          <div class="card-body">
            <div class="profile-avatar mb-4">
              <img
                :src="usuario.avatar || '/default-avatar.png'"
                :alt="usuario.nome"
                class="avatar-img"
                @error="handleImageError"
              />
              <button class="avatar-edit-btn" @click="alterarFoto">📷</button>
            </div>
            <h3>{{ usuario.nome }} {{ usuario.sobrenome }}</h3>
            <p class="text-muted">{{ usuario.cargo }}</p>
            <div class="mt-4">
              <span class="badge" :class="getStatusClass(usuario.status)">
                {{ getStatusText(usuario.status) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Formulário de Edição -->
      <div class="col-span-2">
        <div class="card">
          <div class="card-header">
            <h5>Informações Pessoais</h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="salvarPerfil">
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label>Nome</label>
                  <input
                    v-model="usuario.nome"
                    class="input"
                    required
                    :disabled="isLoading"
                  />
                </div>
                <div>
                  <label>Sobrenome</label>
                  <input
                    v-model="usuario.sobrenome"
                    class="input"
                    required
                    :disabled="isLoading"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label>Email</label>
                  <input
                    v-model="usuario.email"
                    type="email"
                    class="input"
                    required
                    :disabled="isLoading"
                  />
                </div>
                <div>
                  <label>Telefone</label>
                  <input
                    v-model="usuario.telefone"
                    class="input"
                    required
                    :disabled="isLoading"
                  />
                </div>
              </div>

              <div class="mb-4">
                <label>Cargo</label>
                <select
                  v-model="usuario.cargo"
                  class="input"
                  :disabled="isLoading"
                >
                  <option value="Administrador">Administrador</option>
                  <option value="Atendente">Atendente</option>
                  <option value="Profissional">Profissional</option>
                </select>
              </div>

              <div class="flex gap-2">
                <button
                  type="submit"
                  class="btn"
                  :disabled="isLoading || !temAlteracoes"
                >
                  <span
                    v-if="isLoading"
                    class="spinner-border spinner-border-sm me-2"
                  ></span>
                  {{ isLoading ? "Salvando..." : "Salvar Alterações" }}
                </button>
                <button
                  type="button"
                  class="btn-secondary"
                  @click="resetarFormulario"
                  :disabled="isLoading"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Alterar Senha -->
        <div class="card mt-4">
          <div class="card-header">
            <h5>Alterar Senha</h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="alterarSenha">
              <div class="mb-4">
                <label>Senha Atual</label>
                <input
                  v-model="senhas.atual"
                  type="password"
                  class="input"
                  required
                  :disabled="isLoading"
                />
              </div>
              <div class="mb-4">
                <label>Nova Senha</label>
                <input
                  v-model="senhas.nova"
                  type="password"
                  class="input"
                  required
                  :disabled="isLoading"
                />
              </div>
              <div class="mb-4">
                <label>Confirmar Nova Senha</label>
                <input
                  v-model="senhas.confirmar"
                  type="password"
                  class="input"
                  required
                  :disabled="isLoading"
                />
              </div>
              <button type="submit" class="btn-danger" :disabled="isLoading">
                🔒 Alterar Senha
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Estatísticas do Usuário -->
    <div class="card mt-6">
      <div class="card-header">
        <h5>Minhas Estatísticas</h5>
      </div>
      <div class="card-body">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <h3 class="text-primary">{{ estatisticas.agendamentosHoje }}</h3>
            <p class="text-muted">Agendamentos Hoje</p>
          </div>
          <div>
            <h3 class="text-success">{{ estatisticas.clientesAtendidos }}</h3>
            <p class="text-muted">Clientes Atendidos</p>
          </div>
          <div>
            <h3 class="text-warning">R$ {{ estatisticas.faturamento }}</h3>
            <p class="text-muted">Faturamento</p>
          </div>
          <div>
            <h3 class="text-info">{{ estatisticas.diasTrabalhados }}</h3>
            <p class="text-muted">Dias Trabalhados</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useSweetAlert } from "@/composables/useSweetAlert";

interface Usuario {
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  cargo: "Administrador" | "Atendente" | "Profissional";
  status: "ativo" | "inativo";
  avatar: string | null;
}

interface Senhas {
  atual: string;
  nova: string;
  confirmar: string;
}

interface Estatisticas {
  agendamentosHoje: number;
  clientesAtendidos: number;
  faturamento: string;
  diasTrabalhados: number;
}

export default defineComponent({
  name: "ProfileView",
  setup() {
    const router = useRouter();
    const {
      showToast,
      showSuccess,
      showError,
      confirmAction,
      showLoading,
      hideLoading,
      Swal, // agora Swal está disponível
    } = useSweetAlert();

    const isLoading = ref(false);

    /**
     * Estado do usuário
     */
    const usuario = ref<Usuario>({
      nome: "João",
      sobrenome: "Silva",
      email: "joao@barbearia.com",
      telefone: "(11) 99999-1111",
      cargo: "Administrador",
      status: "ativo",
      avatar: null,
    });

    // Mantém cópia para detectar alterações
    const usuarioOriginal = ref<Usuario>({ ...usuario.value });

    /**
     * Formulário de senhas
     */
    const senhas = ref<Senhas>({
      atual: "",
      nova: "",
      confirmar: "",
    });

    /**
     * Estatísticas mockadas
     */
    const estatisticas = ref<Estatisticas>({
      agendamentosHoje: 8,
      clientesAtendidos: 156,
      faturamento: "12.450,00",
      diasTrabalhados: 245,
    });

    /**
     * True se houve qualquer alteração nos dados do usuário
     */
    const temAlteracoes = computed(() => {
      return (
        JSON.stringify(usuario.value) !== JSON.stringify(usuarioOriginal.value)
      );
    });

    function getStatusClass(status: Usuario["status"]) {
      return status === "ativo"
        ? "bg-green-100 text-green-800"
        : "bg-red-100 text-red-800";
    }

    function getStatusText(status: Usuario["status"]) {
      return status === "ativo" ? "Ativo" : "Inativo";
    }

    function handleImageError(event: Event) {
      (event.target as HTMLImageElement).src = "/default-avatar.png";
    }

    /**
     * Seleciona nova foto do perfil
     */
    async function alterarFoto() {
      const { value: file } = await Swal.fire({
        title: "Alterar foto do perfil",
        input: "file",
        inputAttributes: {
          accept: "image/*",
          "aria-label": "Upload da foto do perfil",
        },
        showCancelButton: true,
        confirmButtonText: "Upload",
        cancelButtonText: "Cancelar",
      });

      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          usuario.value.avatar = (e.target?.result as string) || null;
          showSuccess("Foto alterada!", "Sua foto de perfil foi atualizada.");
        };
        reader.readAsDataURL(file);
      }
    }

    /**
     * Persiste dados de perfil
     */
    async function salvarPerfil() {
      if (!temAlteracoes.value) return;

      const confirmed = await confirmAction(
        "Salvar alterações",
        "Deseja salvar as alterações no seu perfil?",
        "Sim, salvar"
      );

      if (!confirmed) return;

      isLoading.value = true;
      showLoading("Salvando perfil...");

      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        usuarioOriginal.value = { ...usuario.value };

        hideLoading();
        showSuccess(
          "Perfil atualizado!",
          "Suas informações foram salvas com sucesso."
        );
        showToast.success("Perfil atualizado!");
      } catch (error) {
        hideLoading();
        showError("Erro", "Falha ao salvar o perfil. Tente novamente.");
      } finally {
        isLoading.value = false;
      }
    }

    function resetarFormulario() {
      usuario.value = { ...usuarioOriginal.value };
      showToast.info("Alterações canceladas");
    }

    /**
     * Troca a senha do usuário
     */
    async function alterarSenha() {
      if (senhas.value.nova !== senhas.value.confirmar) {
        showError(
          "Senhas não conferem",
          "A nova senha e a confirmação devem ser iguais."
        );
        return;
      }

      if (senhas.value.nova.length < 6) {
        showError(
          "Senha muito curta",
          "A nova senha deve ter pelo menos 6 caracteres."
        );
        return;
      }

      const confirmed = await confirmAction(
        "Alterar senha",
        "Tem certeza que deseja alterar sua senha?",
        "Sim, alterar"
      );

      if (!confirmed) return;

      isLoading.value = true;
      showLoading("Alterando senha...");

      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        senhas.value = { atual: "", nova: "", confirmar: "" };

        hideLoading();
        showSuccess("Senha alterada!", "Sua senha foi alterada com sucesso.");
      } catch (error) {
        hideLoading();
        showError("Erro", "Falha ao alterar a senha. Verifique a senha atual.");
      } finally {
        isLoading.value = false;
      }
    }

    /**
     * Faz logout do sistema
     */
    async function logout() {
      const confirmed = await confirmAction(
        "Sair do sistema",
        "Tem certeza que deseja sair?",
        "Sim, sair"
      );

      if (confirmed) {
        showToast.success("Logout realizado!");
        router.push("/login");
      }
    }

    onMounted(() => {
      // Simular carregamento de dados do usuário
    });

    return {
      usuario,
      senhas,
      estatisticas,
      isLoading,
      temAlteracoes,
      getStatusClass,
      getStatusText,
      handleImageError,
      alterarFoto,
      salvarPerfil,
      resetarFormulario,
      alterarSenha,
      logout,
    };
  },
});
</script>

<style scoped>
.profile-avatar {
  position: relative;
  display: inline-block;
}

.avatar-img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #e5e7eb;
}

.avatar-edit-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  font-size: 1.2rem;
}

.card {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: white;
}

.card-header {
  padding: 1rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  border-radius: 0.5rem 0.5rem 0 0;
}

.card-body {
  padding: 1rem;
}

.input {
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.5rem;
  width: 100%;
}

.btn {
  background-color: #4f46e5;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
}

.btn-danger {
  background-color: #dc2626;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.text-primary {
  color: #4f46e5;
}
.text-success {
  color: #10b981;
}
.text-warning {
  color: #f59e0b;
}
.text-info {
  color: #3b82f6;
}
.text-muted {
  color: #6b7280;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
  border: 0.125em solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner-border 0.75s linear infinite;
}

@keyframes spinner-border {
  to {
    transform: rotate(360deg);
  }
}
</style>
