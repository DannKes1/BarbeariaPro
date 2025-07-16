<template>
  <div class="form-container">
    <div class="form-header">
      <div class="header-content">
        <h1 class="form-title">Abrir Caixa</h1>
        <p class="form-subtitle">
          Inicie o expediente registrando a abertura do caixa
        </p>
      </div>
      <router-link to="/caixa/consulta" class="btn btn-secondary">
        <i class="icon-list"></i>
        Consultar Caixa
      </router-link>
    </div>

   
    <div v-if="caixaAberto" class="caixa-aberto-card">
      <div class="status-header">
        <div class="status-icon">🟢</div>
        <h2 class="status-title">Caixa já está aberto!</h2>
      </div>

      <div class="caixa-info">
        <div class="info-row">
          <div class="info-item">
            <label class="info-label">Responsável:</label>
            <span class="info-value">{{ caixaAtual.nomeResponsavel }}</span>
          </div>

          <div class="info-item">
            <label class="info-label">Saldo inicial:</label>
            <span class="info-value money"
              >R$ {{ caixaAtual.saldoInicial }}</span
            >
          </div>
        </div>

        <div class="info-row">
          <div class="info-item">
            <label class="info-label">Aberto em:</label>
            <span class="info-value">{{
              formatarDataHora(caixaAtual.dataAbertura)
            }}</span>
          </div>
        </div>
      </div>

      <div class="caixa-actions">
        <button class="btn btn-primary" @click="irParaFecharCaixa">
          <i class="icon-lock"></i>
          Fechar Caixa
        </button>
      </div>
    </div>

    <form v-else @submit.prevent="abrirCaixa" class="caixa-form">
      <div class="form-section">
        <h3 class="section-title">Configuração Inicial</h3>

        <div class="form-group">
          <label class="form-label" for="saldoInicial"
            >Saldo Inicial (R$) *</label
          >
          <div class="input-wrapper">
            <span class="input-prefix">R$</span>
            <input
              id="saldoInicial"
              v-model="caixa.saldoInicial"
              type="number"
              step="0.01"
              min="0"
              class="form-input input-money"
              required
              placeholder="0,00"
              :disabled="isLoading"
              @input="formatarMoeda"
            />
          </div>
          <p class="field-note">
            Valor em dinheiro disponível no início do expediente
          </p>
        </div>
      </div>

      <div class="form-section">
        <h3 class="section-title">Responsabilidade</h3>

        <div class="form-group">
          <label class="form-label" for="responsavel"
            >Usuário Responsável *</label
          >

          <div v-if="isLoadingUsuarios" class="loading-select">
            <div class="loading-spinner"></div>
            <span>Carregando usuários...</span>
          </div>

          <div v-else-if="erroUsuarios" class="error-select">
            <div class="error-icon">⚠️</div>
            <span>{{ erroUsuarios }}</span>
            <button
              type="button"
              class="btn btn-sm btn-primary"
              @click="carregarUsuarios"
            >
              Tentar Novamente
            </button>
          </div>

          <select
            v-else
            id="responsavel"
            v-model="caixa.usuarioId"
            class="form-select"
            :class="{ 'select-error': erros.usuario }"
            required
            :disabled="isLoading || usuarios.length === 0"
          >
            <option disabled value="">
              {{
                usuarios.length === 0
                  ? "Nenhum usuário encontrado"
                  : "Selecione um usuário"
              }}
            </option>
            <option
              v-for="usuario in usuarios"
              :key="getUsuarioId(usuario)"
              :value="getUsuarioId(usuario)"
            >
              {{ usuario.perfil }} {{ usuario.sobrenome }} -
              {{ usuario.especialidade || "Geral" }}
            </option>
          </select>

          <p v-if="erros.usuario" class="error-message">
            {{ erros.usuario }}
          </p>

          <p class="field-note">
            O usuário será responsável pelo caixa durante o expediente
          </p>
        </div>
      </div>

      <div class="info-box">
        <div class="info-header">
          <i class="info-icon">ℹ️</i>
          <h3 class="info-title">Informações Importantes</h3>
        </div>
        <ul class="info-list">
          <li>O caixa deve ser aberto no início de cada expediente</li>
          <li>Apenas um caixa pode estar aberto por vez</li>
          <li>O usuário responsável será registrado para auditoria</li>
          <li>Confira o saldo inicial antes de confirmar</li>
          <li>Todas as movimentações serão vinculadas a este caixa</li>
        </ul>
      </div>

      <div v-if="caixa.saldoInicial && caixa.usuarioId" class="resumo-box">
        <h3 class="resumo-title">📋 Resumo da Abertura</h3>
        <div class="resumo-content">
          <div class="resumo-item">
            <strong>Saldo inicial:</strong> R$
            {{ formatarValor(caixa.saldoInicial) }}
          </div>
          <div class="resumo-item">
            <strong>Responsável:</strong> {{ getNomeUsuarioSelecionado() }}
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button
          type="button"
          class="btn btn-secondary"
          @click="limparFormulario"
          :disabled="isLoading"
        >
          <i class="icon-refresh"></i>
          Limpar Formulário
        </button>

        <button
          type="submit"
          class="btn btn-primary btn-large"
          :disabled="isLoading || !isFormValid"
        >
          <span v-if="isLoading" class="loading-spinner"></span>
          <i v-else class="icon-unlock"></i>
          {{ isLoading ? "Abrindo caixa..." : "Abrir Caixa" }}
        </button>
      </div>
    </form>
  </div>
</template>


<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useSweetAlert } from "@/composables/useSweetAlert";
import { api } from "@/common/http";
import feather from "feather-icons";

interface Usuario {
  id?: number;
  Id?: number;
  usuarioId?: number;
  perfil: string;
  sobrenome: string;
  especialidade?: string;
  telefone?: string;
  email?: string;
  ativo?: boolean;
}

interface CaixaApi {
  id?: number;
  status: string;
  saldoInicial: number;
  saldoFinal?: number;
  dataAbertura: string;
  dataFechamento?: string;
  usuarioFk: number;
}

interface CaixaAtual {
  nomeResponsavel: string;
  saldoInicial: string;
  dataAbertura: string;
}

export default defineComponent({
  name: "AbrirCaixaView",
  setup() {
    const router = useRouter();
    const { showToast, showError, showSuccess, showLoading, hideLoading, confirmAction } = useSweetAlert();

    const debugMode = ref(true);
    const isLoading = ref(false);
    const isLoadingUsuarios = ref(false);
    const caixaAberto = ref(false);
    const usuarios = ref<Usuario[]>([]);
    const erroUsuarios = ref("");

    const caixa = ref({
      saldoInicial: "",
      usuarioId: "",
    });

    const caixaAtual = ref<CaixaAtual>({
      nomeResponsavel: "",
      saldoInicial: "",
      dataAbertura: "",
    });

    const erros = ref({
      usuario: "",
      saldo: "",
    });

    const isFormValid = computed(() => {
      const saldo = parseFloat(caixa.value.saldoInicial);
      return (
        !isNaN(saldo) &&
        saldo >= 0 &&
        caixa.value.usuarioId &&
        usuarios.value.length > 0
      );
    });

    const getUsuarioId = (usuario: Usuario) => {
      return usuario.id || usuario.Id || usuario.usuarioId;
    };

    const getNomeUsuarioSelecionado = () => {
      const id = parseInt(caixa.value.usuarioId);
      const usuario = usuarios.value.find((p) => getUsuarioId(p) === id);
      if (usuario) {
        return `${usuario.perfil}`;
      }
      return "";
    };

    const carregarUsuarios = async () => {
      isLoadingUsuarios.value = true;
      erroUsuarios.value = "";

      try {
        const response = await api.get("/api/Usuario");

        usuarios.value = response.data || [];

        if (debugMode.value) {
          console.log("✅ Usuários carregados:", usuarios.value);
        }

        if (usuarios.value.length === 0) {
          erroUsuarios.value =
            "Nenhum usuário cadastrado encontrado.";
          showToast.warning(
            "Nenhum usuário encontrado. Cadastre usuários primeiro."
          );
        } else {
          showToast.success(
            `${usuarios.value.length} usuários carregados`
          );
        }
      } catch (error: any) {
        console.error("❌ Erro ao carregar usuários:", error);

        if (error.response?.status === 404) {
          erroUsuarios.value = "Nenhum usuário encontrado.";
        } else if (error.response?.status === 500) {
          erroUsuarios.value = "Erro interno do servidor.";
        } else {
          erroUsuarios.value =
            "Não foi possível carregar os usuários.";
        }

        showError("Erro", erroUsuarios.value);
      } finally {
        isLoadingUsuarios.value = false;
      }
    };

    const verificarStatusCaixa = async () => {
      try {
        const response = await api.get<CaixaApi>("/api/Caixa/ultimo");
        const ultimoCaixa = response.data;

        if (ultimoCaixa.status === "Aberto") {
          try {
            const usuarioResponse = await api.get<Usuario>(
              `/api/Usuario/${ultimoCaixa.usuarioFk}`
            );
            const usuario = usuarioResponse.data;

            caixaAberto.value = true;
            caixaAtual.value = {
              nomeResponsavel: usuario.perfil,
              saldoInicial: ultimoCaixa.saldoInicial.toFixed(2),
              dataAbertura: ultimoCaixa.dataAbertura,
            };
            console.log(caixaAtual);
          } catch (error) {
            caixaAberto.value = true;
            caixaAtual.value = {
              nomeResponsavel: "Usuário não encontrado",
              saldoInicial: ultimoCaixa.saldoInicial.toFixed(2),
              dataAbertura: ultimoCaixa.dataAbertura,
            };
          }
        } else {
          if (ultimoCaixa.saldoFinal != null) {
            caixa.value.saldoInicial = ultimoCaixa.saldoFinal.toFixed(2);
            showToast.info(
              `Saldo inicial sugerido baseado no último fechamento: R$ ${ultimoCaixa.saldoFinal.toFixed(2)}`
            );
          }
        }
      } catch (error: any) {
        console.error("❌ Erro ao verificar status do caixa:", error);

        if (error.response?.status !== 404) {
          showError(
            "Erro ao verificar caixa",
            "Não foi possível obter o status do último caixa."
          );
        }
      }
    };

    const formatarMoeda = () => {
      let valor = caixa.value.saldoInicial.replace(/[^\d.,]/g, "");
      valor = valor.replace(",", ".");
      caixa.value.saldoInicial = valor;
    };

    const formatarValor = (valor: string | number) => {
      const num = typeof valor === "string" ? parseFloat(valor) : valor;
      return isNaN(num) ? "0,00" : num.toFixed(2).replace(".", ",");
    };

    const formatarDataHora = (dataISO: string) => {
      if (!dataISO) return "";
      try {
        return new Date(dataISO).toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch {
        return dataISO;
      }
    };

    const validarFormulario = () => {
      erros.value = { usuario: "", saldo: "" };
      let valido = true;

      const saldo = parseFloat(caixa.value.saldoInicial);
      if (isNaN(saldo) || saldo < 0) {
        erros.value.saldo =
          "Informe um saldo inicial válido (maior ou igual a zero).";
        valido = false;
      }

      const usuarioId = parseInt(caixa.value.usuarioId);
      if (
        isNaN(usuarioId) ||
        !usuarios.value.find(
          (p) => getUsuarioId(p) === usuarioId
        )
      ) {
        erros.value.usuario = "Selecione um usuário responsável.";
        valido = false;
      }

      return valido;
    };

    const abrirCaixa = async () => {
      if (!validarFormulario()) {
        showError(
          "Formulário inválido",
          "Corrija os erros antes de continuar."
        );
        return;
      }

      const saldo = parseFloat(caixa.value.saldoInicial);
      const usuarioId = parseInt(caixa.value.usuarioId);
      const usuario = usuarios.value.find(
        (p) => getUsuarioId(p) === usuarioId
      )!;
      const nomeResponsavel = `${usuario.perfil} ${usuario.sobrenome}`;

      const confirmed = await confirmAction(
        "Confirmar abertura do caixa",
        `Deseja abrir o caixa com as seguintes informações?\n\n` +
          `💰 Saldo inicial: R$ ${formatarValor(saldo)}\n` +
          `👤 Responsável: ${nomeResponsavel}\n` +
          `📝 Observações: ${caixa.value.observacoes || "Nenhuma"}`,
        "Sim, abrir caixa"
      );

      if (!confirmed) return;

      isLoading.value = true;
      showLoading("Abrindo caixa...");

      try {
        const agora = new Date();
        const payload = {
          id: 0,
          saldoInicial: saldo,
          saldoFinal: saldo,
          dataAbertura: agora.toISOString(),
          dataFechamento: agora.toISOString(),
          status: "Aberto",
          usuarioFk: usuarioId,
        };

        await api.post("/api/Caixa", payload);

        caixaAtual.value = {
          nomeResponsavel,
          saldoInicial: saldo.toFixed(2),
          dataAbertura: agora.toISOString(),
        };

        caixaAberto.value = true;
        hideLoading();

        showSuccess(
          "Caixa aberto com sucesso!",
          `Caixa aberto por ${nomeResponsavel} com saldo inicial de R$ ${formatarValor(saldo)}.`
        );

        showToast.success("Caixa aberto! Bom trabalho!");
        limparFormulario();
      } catch (error: any) {
        hideLoading();
        console.error("❌ Erro ao abrir caixa:", error);

        if (error.response?.status === 400) {
          const mensagem =
            error.response.data?.message ||
            "Dados inválidos para abertura do caixa.";
          showError("Erro de validação", mensagem);
        } else if (error.response?.status === 409) {
          showError(
            "Caixa já aberto",
            "Já existe um caixa aberto. Feche o caixa atual antes de abrir um novo."
          );
          verificarStatusCaixa();
        } else {
          showError(
            "Erro no servidor",
            "Não foi possível abrir o caixa. Tente novamente."
          );
        }
      } finally {
        isLoading.value = false;
      }
    };

    const limparFormulario = () => {
      caixa.value = {
        saldoInicial: "",
        usuarioId: "",
      };
      erros.value = { usuario: "", saldo: "" };
      showToast.info("Formulário limpo");
    };

    const irParaFecharCaixa = () => {
      router.push("/caixa/fechar");
    };

    const irParaExtrato = () => {
      router.push("/caixa/extrato");
    };

    onMounted(async () => {
      feather.replace();

      await Promise.all([carregarUsuarios(), verificarStatusCaixa()]);
    });

    return {
      isLoading,
      isLoadingUsuarios,
      caixaAberto,
      usuarios,
      erroUsuarios,
      caixa,
      caixaAtual,
      erros,
      debugMode,

      isFormValid,

      getUsuarioId,
      getNomeUsuarioSelecionado,
      carregarUsuarios,
      formatarMoeda,
      formatarValor,
      formatarDataHora,
      abrirCaixa,
      limparFormulario,
      irParaFecharCaixa,
      irParaExtrato,
    };
  },
});
</script>

<style scoped>
/* Debug Info */
.debug-info {
  background: #fef3c7;
  border: 2px solid #f59e0b;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  font-family: monospace;
  font-size: 0.875rem;
}

.debug-info h3 {
  margin: 0 0 0.5rem 0;
  color: #92400e;
}

.debug-info pre {
  background: #f3f4f6;
  padding: 0.5rem;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.75rem;
  max-height: 200px;
}

/* Container Principal */
.form-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Cabeçalho */
.form-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #f3f4f6;
}

.header-content {
  flex: 1;
}

.form-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.form-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

/* Card Caixa Aberto */
.caixa-aberto-card {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border: 2px solid #10b981;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.status-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.status-icon {
  font-size: 2rem;
}

.status-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #065f46;
  margin: 0;
}

.caixa-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.info-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #047857;
}

.info-value {
  font-size: 1rem;
  color: #065f46;
}

.info-value.money {
  font-size: 1.25rem;
  font-weight: 700;
}

.caixa-actions {
  display: flex;
  gap: 1rem;
}

/* Formulário */
.caixa-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Seções do Formulário */
.form-section {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #d1d5db;
}

/* Grupos de Formulário */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

/* Inputs */
.form-input,
.form-select,
.form-textarea {
  padding: 0.75rem;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s ease-in-out;
  background: #ffffff;
  font-family: inherit;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input:disabled,
.form-select:disabled,
.form-textarea:disabled {
  background-color: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

/* Input com prefixo */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-prefix {
  position: absolute;
  left: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  z-index: 1;
}

.input-money {
  padding-left: 2.5rem;
}

/* Estados de erro */
.select-error {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  font-weight: 500;
}

.field-note {
  color: #6b7280;
  font-size: 0.75rem;
  font-style: italic;
}

/* Estados de carregamento e erro para select */
.loading-select,
.error-select {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  background: #f9fafb;
}

.loading-select {
  color: #6b7280;
}

.error-select {
  color: #dc2626;
  border-color: #fecaca;
  background: #fef2f2;
}

.error-icon {
  font-size: 1.25rem;
}

/* Box de informações */
.info-box {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-left: 4px solid #3b82f6;
  border-radius: 8px;
  padding: 1.5rem;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.info-icon {
  font-size: 1.5rem;
}

.info-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1e40af;
  margin: 0;
}

.info-list {
  margin: 0;
  padding-left: 1.5rem;
  color: #1e40af;
}

.info-list li {
  margin-bottom: 0.5rem;
}

/* Box de resumo */
.resumo-box {
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 8px;
  padding: 1.5rem;
}

.resumo-title {
  font-size: 1rem;
  font-weight: 600;
  color: #0c4a6e;
  margin-bottom: 1rem;
}

.resumo-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.resumo-item {
  color: #0c4a6e;
  font-size: 0.875rem;
}

/* Botões de Ação */
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 2rem;
  border-top: 2px solid #f3f4f6;
}

/* Botões */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-decoration: none;
  justify-content: center;
}

.btn-sm {
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1rem;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: #ffffff;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 8px -1px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
  background: #ffffff;
  color: #6b7280;
  border: 2px solid #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
  color: #374151;
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* Spinner de Loading */
.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Ícones */
.icon-list::before {
  content: "📋";
}
.icon-lock::before {
  content: "🔒";
}
.icon-unlock::before {
  content: "🔓";
}
.icon-file-text::before {
  content: "📄";
}
.icon-refresh::before {
  content: "↻";
}

/* Responsividade */
@media (max-width: 768px) {
  .form-container {
    padding: 1rem;
    margin: 1rem;
  }

  .form-header {
    flex-direction: column;
    gap: 1rem;
  }

  .info-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .caixa-actions {
    flex-direction: column;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .form-container {
    margin: 0.5rem;
    padding: 0.75rem;
  }

  .form-section {
    padding: 1rem;
  }
}
</style>
