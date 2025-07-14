<template>
  <div class="form-container">
    <div class="form-header">
      <div class="header-content">
        <h1 class="form-title">Editar Cliente</h1>
        <p class="form-subtitle">
          Altere os dados do cliente conforme necessário
        </p>
      </div>
      <button
        class="btn btn-secondary btn-back"
        @click="voltarParaConsulta"
        :disabled="isLoading"
      >
        <i class="icon-arrow-left"></i>
        Voltar
      </button>
    </div>

    <!-- Debug Info (remover em produção) -->
    <div v-if="debugMode" class="debug-info">
      <h3>🔍 Debug Info</h3>
      <p><strong>Props ID:</strong> {{ props.id }} ({{ typeof props.id }})</p>
      <p><strong>Route ID:</strong> {{ routeId }} ({{ typeof routeId }})</p>
      <p>
        <strong>Cliente ID Final:</strong> {{ clienteId }} ({{
          typeof clienteId
        }})
      </p>
      <p><strong>ID Válido:</strong> {{ isValidId ? "✅" : "❌" }}</p>
    </div>

    <!-- Estado de Carregamento -->
    <div v-if="!cliente && !erro && isValidId" class="loading-state">
      <div class="loading-spinner-large"></div>
      <p class="loading-text">Carregando dados do cliente...</p>
    </div>

    <!-- Estado de Erro -->
    <div v-if="erro || !isValidId" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3 class="error-title">Erro ao Carregar Cliente</h3>
      <p class="error-message">{{ erro || "ID do cliente inválido." }}</p>
      <div class="error-actions">
        <button
          class="btn btn-primary"
          @click="carregarCliente"
          :disabled="isLoading || !isValidId"
          v-if="isValidId"
        >
          <i class="icon-refresh"></i>
          Tentar Novamente
        </button>
        <button class="btn btn-secondary" @click="voltarParaConsulta">
          <i class="icon-arrow-left"></i>
          Voltar para Consulta
        </button>
      </div>
    </div>

    <!-- Formulário de Edição -->
    <form
      v-if="cliente && isValidId"
      @submit.prevent="submitForm"
      class="client-form"
    >
      <!-- Dados Pessoais -->
      <div class="form-section">
        <h2 class="section-title">Dados Pessoais</h2>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Nome *</label>
            <input
              v-model="cliente.nome"
              class="form-input"
              :class="{ 'input-changed': isFieldChanged('nome') }"
              required
              pattern="[A-Za-zÀ-ü ]+"
              :disabled="isLoading"
              placeholder="Digite o nome"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Sobrenome *</label>
            <input
              v-model="cliente.sobrenome"
              class="form-input"
              :class="{ 'input-changed': isFieldChanged('sobrenome') }"
              required
              pattern="[A-Za-zÀ-ü ]+"
              :disabled="isLoading"
              placeholder="Digite o sobrenome"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Telefone *</label>
            <input
              v-model="cliente.telefone"
              class="form-input"
              :class="{ 'input-changed': isFieldChanged('telefone') }"
              required
              :disabled="isLoading"
              placeholder="(11) 98765-4321"
              @input="formatarTelefone"
              maxlength="15"
            />
          </div>

          <div class="form-group">
            <label class="form-label">CPF</label>
            <input
              v-model="cliente.cpf"
              class="form-input input-readonly"
              readonly
              placeholder="000.000.000-00"
              maxlength="14"
            />
            <p class="field-note">CPF não pode ser alterado</p>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">E-mail</label>
            <input
              v-model="cliente.email"
              class="form-input"
              :class="{ 'input-changed': isFieldChanged('email') }"
              type="email"
              :disabled="isLoading"
              placeholder="exemplo@email.com"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Data de Nascimento *</label>
            <input
              v-model="cliente.dataNascimento"
              class="form-input"
              :class="{
                'input-error': erros.dataNascimento,
                'input-changed': isFieldChanged('dataNascimento'),
              }"
              required
              type="date"
              @change="validarIdade"
              :disabled="isLoading"
            />
            <p v-if="erros.dataNascimento" class="error-message">
              {{ erros.dataNascimento }}
            </p>
          </div>
        </div>
      </div>

      <!-- Dados Adicionais -->
      <div class="form-section">
        <h2 class="section-title">Dados Adicionais</h2>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Endereço</label>
            <input
              v-model="cliente.endereco"
              class="form-input"
              :class="{ 'input-changed': isFieldChanged('endereco') }"
              :disabled="isLoading"
              placeholder="Rua, número, bairro"
            />
          </div>

          <div class="form-group">
            <label class="form-label">CEP</label>
            <input
              v-model="cliente.cep"
              class="form-input"
              :class="{ 'input-changed': isFieldChanged('cep') }"
              :disabled="isLoading"
              placeholder="00000-000"
              @input="formatarCEP"
              @blur="buscarCEP"
              maxlength="9"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Cidade</label>
            <input
              v-model="cliente.cidade"
              class="form-input"
              :class="{ 'input-changed': isFieldChanged('cidade') }"
              :disabled="isLoading"
              placeholder="Nome da cidade"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Estado</label>
            <select
              v-model="cliente.estado"
              class="form-select"
              :class="{ 'input-changed': isFieldChanged('estado') }"
              :disabled="isLoading"
            >
              <option value="">Selecione o estado</option>
              <option value="AC">Acre</option>
              <option value="AL">Alagoas</option>
              <option value="AP">Amapá</option>
              <option value="AM">Amazonas</option>
              <option value="BA">Bahia</option>
              <option value="CE">Ceará</option>
              <option value="DF">Distrito Federal</option>
              <option value="ES">Espírito Santo</option>
              <option value="GO">Goiás</option>
              <option value="MA">Maranhão</option>
              <option value="MT">Mato Grosso</option>
              <option value="MS">Mato Grosso do Sul</option>
              <option value="MG">Minas Gerais</option>
              <option value="PA">Pará</option>
              <option value="PB">Paraíba</option>
              <option value="PR">Paraná</option>
              <option value="PE">Pernambuco</option>
              <option value="PI">Piauí</option>
              <option value="RJ">Rio de Janeiro</option>
              <option value="RN">Rio Grande do Norte</option>
              <option value="RS">Rio Grande do Sul</option>
              <option value="RO">Rondônia</option>
              <option value="RR">Roraima</option>
              <option value="SC">Santa Catarina</option>
              <option value="SP">São Paulo</option>
              <option value="SE">Sergipe</option>
              <option value="TO">Tocantins</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Observações</label>
            <textarea
              v-model="cliente.observacoes"
              class="form-textarea"
              :class="{ 'input-changed': isFieldChanged('observacoes') }"
              :disabled="isLoading"
              placeholder="Informações adicionais sobre o cliente"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Como conheceu o salão?</label>
            <select
              v-model="cliente.comoConheceu"
              class="form-select"
              :class="{ 'input-changed': isFieldChanged('comoConheceu') }"
              :disabled="isLoading"
            >
              <option value="">Selecione uma opção</option>
              <option value="Indicação de amigo">Indicação de amigo</option>
              <option value="Redes sociais">Redes sociais</option>
              <option value="Google/Internet">Google/Internet</option>
              <option value="Passou na frente">Passou na frente</option>
              <option value="Panfleto/Propaganda">Panfleto/Propaganda</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Indicador de Alterações -->
      <div v-if="temAlteracoes" class="changes-indicator">
        <div class="changes-content">
          <i class="icon-info"></i>
          <span>Você possui alterações não salvas</span>
        </div>
      </div>

      <!-- Botões de Ação -->
      <div class="form-actions">
        <div class="actions-group">
          <div class="secondary-actions">
            <button
              type="button"
              class="btn btn-secondary"
              @click="resetarFormulario"
              :disabled="isLoading || !temAlteracoes"
            >
              <i class="icon-undo"></i>
              Desfazer Alterações
            </button>

            <button
              type="button"
              class="btn btn-danger"
              @click="excluirCliente"
              :disabled="isLoading"
            >
              <i class="icon-trash"></i>
              Excluir Cliente
            </button>
          </div>

          <button
            class="btn btn-primary"
            type="submit"
            :disabled="isLoading || !temAlteracoes || !isFormValid"
          >
            <span v-if="isLoading" class="loading-spinner"></span>
            <i v-else class="icon-check"></i>
            {{ isLoading ? "Salvando..." : "Salvar Alterações" }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import { useSweetAlert } from "@/composables/useSweetAlert";
import { api } from "@/common/http";
import feather from "feather-icons";

export default defineComponent({
  name: "ClienteEditarView",
  props: {
    id: {
      type: String,
      required: false, // Tornando opcional para permitir fallback
    },
  },
  setup(props) {
    const router = useRouter();
    const route = useRoute();
    const {
      showToast,
      showError,
      showSuccess,
      showLoading,
      hideLoading,
      confirmAction,
      confirmDelete,
    } = useSweetAlert();

    // Debug mode (remover em produção)
    const debugMode = ref(false);

    // Obter ID de forma robusta
    const routeId = computed(() => route.params.id as string);

    const clienteId = computed(() => {
      // Primeiro tenta props, depois route params
      const propId = props.id;
      const paramId = routeId.value;

      const id = propId || paramId;
      const numericId = Number(id);

      // Log para debug
      if (debugMode.value) {
        console.log("🔍 Debug ClienteEditarView:");
        console.log("Props ID:", propId, typeof propId);
        console.log("Route Param ID:", paramId, typeof paramId);
        console.log("ID Final:", id, typeof id);
        console.log("Numeric ID:", numericId, typeof numericId);
        console.log("Is Valid:", !isNaN(numericId) && numericId > 0);
      }

      return isNaN(numericId) ? null : numericId;
    });

    const isValidId = computed(() => {
      return clienteId.value !== null && clienteId.value > 0;
    });

    const isLoading = ref(false);
    const erro = ref("");
    const cliente = ref<any>(null);
    const clienteOriginal = ref<any>(null);
    const erros = ref({
      dataNascimento: "",
      cep: "",
    });

    // Computed para validar se o formulário está válido
    const isFormValid = computed(() => {
      if (!cliente.value) return false;
      return (
        cliente.value.nome?.trim() &&
        cliente.value.sobrenome?.trim() &&
        cliente.value.telefone?.trim() &&
        cliente.value.dataNascimento &&
        !erros.value.dataNascimento
      );
    });

    // Computed para detectar alterações
    const temAlteracoes = computed(() => {
      if (!cliente.value || !clienteOriginal.value) return false;

      const campos = [
        "nome",
        "sobrenome",
        "telefone",
        "email",
        "dataNascimento",
        "endereco",
        "cep",
        "cidade",
        "estado",
        "observacoes",
        "comoConheceu",
      ];

      return campos.some(
        (campo) =>
          (cliente.value[campo] || "") !== (clienteOriginal.value[campo] || "")
      );
    });

    // Função para verificar se um campo específico foi alterado
    const isFieldChanged = (campo: string) => {
      if (!cliente.value || !clienteOriginal.value) return false;
      return (
        (cliente.value[campo] || "") !== (clienteOriginal.value[campo] || "")
      );
    };

    // Carregar dados do cliente
    const carregarCliente = async () => {
      if (!isValidId.value) {
        erro.value =
          "ID do cliente inválido. Verifique se o link está correto.";
        return;
      }

      isLoading.value = true;
      erro.value = "";

      try {
        console.log(`🔄 Carregando cliente ID: ${clienteId.value}`);
        const response = await api.get(`/api/Cliente/${clienteId.value}`);

        cliente.value = { ...response.data };
        clienteOriginal.value = { ...response.data };

        // Formatar campos se necessário
        if (cliente.value.cpf) {
          cliente.value.cpf = formatarCPFDisplay(cliente.value.cpf);
        }
        if (cliente.value.telefone) {
          cliente.value.telefone = formatarTelefoneDisplay(
            cliente.value.telefone
          );
        }
        if (cliente.value.cep) {
          cliente.value.cep = formatarCEPDisplay(cliente.value.cep);
        }

        console.log("✅ Cliente carregado:", cliente.value);
      } catch (error: any) {
        console.error("❌ Erro ao carregar cliente:", error);

        if (error.response?.status === 404) {
          erro.value = "Cliente não encontrado. Pode ter sido excluído.";
        } else if (error.response?.status === 400) {
          erro.value = "Solicitação inválida. Verifique o ID do cliente.";
        } else {
          erro.value =
            "Não foi possível carregar os dados do cliente. Tente novamente.";
        }
        showError("Erro", erro.value);
      } finally {
        isLoading.value = false;
      }
    };

    // Formatação automática do telefone
    function formatarTelefone() {
      let valor = cliente.value.telefone.replace(/\D/g, "");

      if (valor.length <= 11) {
        valor = valor.replace(/(\d{2})(\d)/, "($1) $2");
        valor = valor.replace(/(\d{4,5})(\d{4})$/, "$1-$2");
        cliente.value.telefone = valor;
      }
    }

    // Formatação automática do CEP
    function formatarCEP() {
      let valor = cliente.value.cep.replace(/\D/g, "");

      if (valor.length <= 8) {
        valor = valor.replace(/(\d{5})(\d)/, "$1-$2");
        cliente.value.cep = valor;
      }

      if (erros.value.cep && valor.length < 9) {
        erros.value.cep = "";
      }
    }

    // Funções auxiliares para formatação de display
    function formatarCPFDisplay(cpf: string) {
      const numeros = cpf.replace(/\D/g, "");
      return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }

    function formatarTelefoneDisplay(telefone: string) {
      const numeros = telefone.replace(/\D/g, "");
      if (numeros.length === 11) {
        return numeros.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
      } else if (numeros.length === 10) {
        return numeros.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
      }
      return telefone;
    }

    function formatarCEPDisplay(cep: string) {
      const numeros = cep.replace(/\D/g, "");
      return numeros.replace(/(\d{5})(\d{3})/, "$1-$2");
    }

    // Validação da idade
    function validarIdade() {
      const hoje = new Date();
      const nascimento = new Date(cliente.value.dataNascimento);
      let idade = hoje.getFullYear() - nascimento.getFullYear();
      const ajuste =
        hoje.getMonth() < nascimento.getMonth() ||
        (hoje.getMonth() === nascimento.getMonth() &&
          hoje.getDate() < nascimento.getDate());

      if (idade - (ajuste ? 1 : 0) < 16) {
        erros.value.dataNascimento = "Cliente deve ter pelo menos 16 anos.";
        return false;
      }

      erros.value.dataNascimento = "";
      return true;
    }

    // Busca de CEP via API
    async function buscarCEP() {
      const cep = cliente.value.cep.replace(/\D/g, "");

      if (cep.length !== 8) {
        if (cep.length > 0) {
          erros.value.cep = "CEP deve conter 8 dígitos.";
        }
        return;
      }

      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (data.erro) {
          erros.value.cep = "CEP não encontrado.";
          return;
        }

        // Preencher automaticamente os campos de endereço
        cliente.value.endereco = `${data.logradouro}, ${data.bairro}`;
        cliente.value.cidade = data.localidade;
        cliente.value.estado = data.uf;
        erros.value.cep = "";

        showToast.success(
          "CEP encontrado! Endereço preenchido automaticamente."
        );
      } catch (error) {
        erros.value.cep = "Erro ao buscar CEP.";
      }
    }

    // Submissão do formulário
    async function submitForm() {
      // Validações finais
      if (!isFormValid.value) {
        showError(
          "Formulário incompleto",
          "Por favor, preencha todos os campos obrigatórios corretamente."
        );
        return;
      }

      if (!validarIdade()) {
        showError("Dados inválidos", "Corrija os erros antes de salvar.");
        return;
      }

      // Confirmar alterações
      const confirmed = await confirmAction(
        "Confirmar alterações",
        `Deseja salvar as alterações do cliente ${cliente.value.nome} ${cliente.value.sobrenome}?`,
        "Sim, salvar"
      );

      if (!confirmed) return;

      isLoading.value = true;
      showLoading("Salvando alterações...");

      try {
        // Preparar dados para envio
        const payload = {
          id: clienteId.value,
          nome: cliente.value.nome.trim(),
          sobrenome: cliente.value.sobrenome.trim(),
          telefone: cliente.value.telefone.replace(/\D/g, ""),
          cpf: cliente.value.cpf.replace(/[\.\-]/g, ""),
          email: cliente.value.email?.trim() || null,
          dataNascimento: cliente.value.dataNascimento,
          endereco: cliente.value.endereco?.trim() || null,
          cep: cliente.value.cep?.replace(/\D/g, "") || null,
          cidade: cliente.value.cidade?.trim() || null,
          estado: cliente.value.estado || null,
          observacoes: cliente.value.observacoes?.trim() || null,
          comoConheceu: cliente.value.comoConheceu || null,
        };

        console.log("💾 Salvando cliente:", payload);
        await api.put(`/api/Cliente/${clienteId.value}`, payload);

        // Atualizar dados originais
        clienteOriginal.value = { ...cliente.value };

        hideLoading();
        showSuccess(
          "Cliente atualizado!",
          `${cliente.value.nome} ${cliente.value.sobrenome} foi atualizado com sucesso.`
        );

        showToast.success("Alterações salvas com sucesso!");
      } catch (error: any) {
        hideLoading();
        console.error("❌ Erro ao salvar:", error);

        if (error.response?.status === 404) {
          showError(
            "Cliente não encontrado",
            "O cliente pode ter sido excluído por outro usuário."
          );
        } else if (error.response?.status === 400) {
          const errosAPI =
            error.response.data?.errors || error.response.data?.message;
          showError(
            "Erro de validação",
            typeof errosAPI === "string"
              ? errosAPI
              : JSON.stringify(errosAPI, null, 2)
          );
        } else {
          showError(
            "Erro no servidor",
            "Ocorreu um erro ao salvar as alterações. Tente novamente."
          );
        }
      } finally {
        isLoading.value = false;
      }
    }

    // Resetar formulário
    function resetarFormulario() {
      cliente.value = { ...clienteOriginal.value };
      erros.value = { dataNascimento: "", cep: "" };
      showToast.info("Alterações desfeitas");
    }

    // Excluir cliente
    async function excluirCliente() {
      const confirmed = await confirmDelete(
        "Excluir cliente",
        `Tem certeza que deseja excluir ${cliente.value.nome} ${cliente.value.sobrenome}? Esta ação não pode ser desfeita.`,
        "Sim, excluir"
      );

      if (!confirmed) return;

      isLoading.value = true;
      showLoading("Excluindo cliente...");

      try {
        await api.delete(`/api/Cliente/${clienteId.value}`);

        hideLoading();
        showSuccess("Cliente excluído", "Cliente removido com sucesso.");

        router.push("/cliente/consulta");
      } catch (error: any) {
        hideLoading();

        if (error.response?.status === 404) {
          showError(
            "Cliente não encontrado",
            "O cliente pode já ter sido excluído."
          );
        } else {
          showError(
            "Erro no servidor",
            "Não foi possível excluir o cliente. Tente novamente."
          );
        }
      } finally {
        isLoading.value = false;
      }
    }

    // Voltar para consulta
    async function voltarParaConsulta() {
      if (temAlteracoes.value) {
        const confirmed = await confirmAction(
          "Alterações não salvas",
          "Você possui alterações não salvas. Deseja sair mesmo assim?",
          "Sim, sair"
        );
        if (!confirmed) return;
      }
      router.push("/cliente/consulta");
    }

    // Prevenir saída acidental
    const beforeUnloadHandler = (e: BeforeUnloadEvent) => {
      if (temAlteracoes.value) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    onMounted(() => {
      console.log("🚀 ClienteEditarView montado");

      if (isValidId.value) {
        carregarCliente();
      } else {
        console.error("❌ ID inválido detectado no mount");
      }

      feather.replace();
      window.addEventListener("beforeunload", beforeUnloadHandler);
    });

    onBeforeUnmount(() => {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
    });

    return {
      // Props e computed
      props,
      routeId,
      clienteId,
      isValidId,
      debugMode,

      // Estado
      cliente,
      erro,
      isLoading,
      erros,
      isFormValid,
      temAlteracoes,

      // Funções
      isFieldChanged,
      carregarCliente,
      formatarTelefone,
      formatarCEP,
      validarIdade,
      buscarCEP,
      submitForm,
      resetarFormulario,
      excluirCliente,
      voltarParaConsulta,
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

.debug-info p {
  margin: 0.25rem 0;
  color: #78350f;
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

/* Cabeçalho do Formulário */
.form-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2.5rem;
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

.btn-back {
  margin-left: 1rem;
}

/* Estados de Loading e Erro */
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-spinner-large {
  width: 3rem;
  height: 3rem;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.loading-text {
  font-size: 1.125rem;
  color: #6b7280;
  margin: 0;
}

.error-state {
  text-align: center;
  padding: 4rem 2rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #dc2626;
  margin-bottom: 0.5rem;
}

.error-message {
  color: #7f1d1d;
  margin-bottom: 2rem;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Formulário */
.client-form {
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
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #d1d5db;
}

/* Layout dos Campos */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
}

/* Labels */
.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
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

.form-input::placeholder,
.form-textarea::placeholder {
  color: #9ca3af;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

/* Estados Especiais dos Inputs */
.input-readonly {
  background-color: #f9fafb !important;
  color: #6b7280 !important;
  cursor: not-allowed;
}

.input-changed {
  border-color: #f59e0b !important;
  background-color: #fffbeb !important;
}

.input-error {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  font-weight: 500;
}

.field-note {
  color: #6b7280;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  font-style: italic;
}

/* Indicador de Alterações */
.changes-indicator {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.changes-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #92400e;
  font-weight: 500;
}

/* Área de Ações */
.form-actions {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #f3f4f6;
}

.actions-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.secondary-actions {
  display: flex;
  gap: 1rem;
}

/* Botões */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-decoration: none;
  min-width: 160px;
  justify-content: center;
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

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #ffffff;
  box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.3);
}

.btn-danger:hover:not(:disabled) {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 8px -1px rgba(239, 68, 68, 0.4);
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
.icon-check::before {
  content: "✓";
}
.icon-undo::before {
  content: "↶";
}
.icon-trash::before {
  content: "🗑";
}
.icon-refresh::before {
  content: "↻";
}
.icon-arrow-left::before {
  content: "←";
}
.icon-info::before {
  content: "ℹ";
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

  .btn-back {
    margin-left: 0;
    align-self: flex-start;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .actions-group {
    flex-direction: column;
    gap: 1rem;
  }

  .secondary-actions {
    flex-direction: column;
    width: 100%;
  }

  .error-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
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
