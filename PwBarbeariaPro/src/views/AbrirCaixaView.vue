<template>
  <div>
    <h1 class="form-title">Abrir Caixa</h1>

    <div v-if="caixaAberto" class="card-caixa-aberto">
      <h2 class="mb-3 text-success">🟢 Caixa já está aberto!</h2>
      <p><strong>Responsável:</strong> {{ caixaAtual.nomeUsuario }}</p>
      <p><strong>Aberto em:</strong> {{ formatarDataHora(caixaAtual.dataAbertura) }}</p>
      <p><strong>Saldo inicial:</strong> R$ {{ parseFloat(caixaAtual.saldoInicial).toFixed(2) }}</p>

      <div class="mt-4">
        <button class="btn btn-primary" @click="irParaFecharCaixa">
          Fechar Caixa
        </button>
      </div>
    </div>

    <form v-else @submit.prevent="abrirCaixa" class="form-body">
      <div class="form-group">
        <label for="saldoInicial">Saldo Inicial (R$)</label>
        <input
          id="saldoInicial"
          v-model="caixa.saldoInicial"
          type="number"
          step="0.01"
          class="input"
          required
          placeholder="0,00"
          :disabled="isLoading"
        />
        <small class="helper-text">Valor em dinheiro disponível no início do expediente</small>
      </div>

      <div class="form-group">
        <label for="responsavel">Responsável</label>
        <select
          id="responsavel"
          v-model="caixa.usuarioFk"
          class="input"
          required
          :disabled="isLoading"
        >
          <option disabled value="">Selecione um usuário</option>
          <option v-for="u in usuarios" :key="u.id" :value="u.id">
            {{ u.nome || u.perfil || 'Usuário' }} | {{ u.email }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>Observações</label>
        <textarea
          v-model="caixa.observacoes"
          class="input"
          rows="3"
          placeholder="Observações sobre a abertura do caixa (opcional)"
          :disabled="isLoading"
        ></textarea>
      </div>

      <div class="info-box">
        <h3>ℹ️ Informações Importantes</h3>
        <ul>
          <li>• O caixa deve ser aberto no início de cada expediente</li>
          <li>• Apenas um caixa pode estar aberto por vez</li>
          <li>• O responsável será registrado para auditoria</li>
          <li>• Confira o saldo inicial antes de confirmar</li>
        </ul>
      </div>

      <div class="form-actions">
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="spinner"></span>
          {{ isLoading ? 'Abrindo...' : 'Abrir Caixa' }}
        </button>

        <button
          type="button"
          class="btn btn-secondary"
          @click="limparFormulario"
          :disabled="isLoading"
        >
          Limpar
        </button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useSweetAlert } from '@/composables/useSweetAlert';
import { api } from '@/common/http';
import feather from "feather-icons";

export default defineComponent({
  name: "AbrirCaixaView",
  setup() {
    const { showToast, showError, showSuccess, showLoading, hideLoading, confirmAction } = useSweetAlert();
    const router = useRouter();

    const isLoading = ref(false);
    const caixaAberto = ref(false);
    const usuarios = ref([]);

    const caixa = ref({
      saldoInicial: "",
      usuarioFk: "",
      observacoes: ""
    });

    const caixaAtual = ref({
      nomeUsuario: "",
      saldoInicial: "",
      dataAbertura: "",
      observacoes: ""
    });

    function formatarDataHora(dataISO: string) {
      if (!dataISO) return "";
      return new Date(dataISO).toLocaleString('pt-BR');
    }

    function irParaFecharCaixa() {
      router.push("/caixa/fechar");
    }

    async function abrirCaixa() {
      const saldo = parseFloat(caixa.value.saldoInicial);
      const usuarioId = parseInt(caixa.value.usuarioFk);

      if (isNaN(saldo) || saldo < 0) {
        showError('Saldo inválido', 'Informe um saldo inicial válido.');
        return;
      }

      if (isNaN(usuarioId)) {
        showError('Responsável obrigatório', 'Selecione um usuário responsável.');
        return;
      }

      const user = usuarios.value.find(u => u.id === usuarioId);
      const nomeUsuario = user?.nome || user?.perfil || 'Desconhecido';

      const confirmed = await confirmAction(
        'Confirmar abertura do caixa',
        `Abrir caixa com saldo inicial de R$ ${saldo.toFixed(2)}?\n\nResponsável: ${nomeUsuario}`,
        'Sim, abrir caixa'
      );
      if (!confirmed) return;

      isLoading.value = true;
      showLoading('Abrindo caixa...');

      try {
        const now = new Date();

        const payload = {
          id: Math.floor(Math.random() * 1000000),
          saldoInicial: saldo,
          saldoFinal: saldo,
          dataAbertura: now.toISOString(),
          dataFechamento: now.toISOString(),
          status: "Aberto",
          usuarioFk: usuarioId,
          nomeUsuario: nomeUsuario
        };

        await api.post('/api/Caixa', payload);

        caixaAtual.value = {
          nomeUsuario,
          saldoInicial: saldo.toFixed(2),
          dataAbertura: now.toISOString(),
          observacoes: caixa.value.observacoes
        };

        caixaAberto.value = true;

        hideLoading();
        showSuccess('Caixa aberto!', `Caixa aberto com sucesso por ${nomeUsuario}.`, 'Continuar');
        showToast.success('Caixa aberto com sucesso!');
        limparFormulario();
      } catch (error) {
        hideLoading();
        showError('Erro no servidor', 'Erro ao abrir o caixa.');
      } finally {
        isLoading.value = false;
      }
    }

    function limparFormulario() {
      Object.assign(caixa.value, {
        saldoInicial: "",
        usuarioFk: "",
        observacoes: ""
      });
      showToast.info('Formulário limpo');
    }

    onMounted(async () => {
      feather.replace();

      try {
        const responseUsuarios = await api.get('/api/Usuario');
        usuarios.value = responseUsuarios.data;
      } catch {
        showError('Erro ao carregar usuários', 'Não foi possível buscar os usuários.');
      }

      try {
        const responseCaixa = await api.get('/api/Caixa/ultimo');
        const ultimo = responseCaixa.data;

        if (ultimo && ultimo.status === "Aberto") {
          const responsavel = await api.get(`/api/Usuario/${ultimo.usuarioFk}`);

          caixaAberto.value = true;
          caixaAtual.value = {
            nomeUsuario: responsavel.data.nome || responsavel.data.perfil || "Desconhecido",
            saldoInicial: ultimo.saldoInicial.toFixed(2),
            dataAbertura: ultimo.dataAbertura,
            observacoes: ultimo.observacoes || ""
          };
        } else {
          if (ultimo?.saldoFinal != null) {
            caixa.value.saldoInicial = ultimo.saldoFinal.toFixed(2);
          }
        }
      } catch {
        showError('Erro ao verificar caixa', 'Não foi possível obter o status do último caixa.');
      }
    });

    return {
      usuarios,
      caixa,
      caixaAtual,
      caixaAberto,
      isLoading,
      formatarDataHora,
      abrirCaixa,
      limparFormulario,
      irParaFecharCaixa
    };
  }
});
</script>

<style scoped>
.form-wrapper {
  padding: 2rem;
  max-width: 700px;
  margin: 0 auto;
  background: #f9fafb;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}

.form-title {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #1f2937;
}

.form-group {
  margin-bottom: 1.5rem;
}

.input {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0.625rem 0.75rem;
  width: 100%;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

textarea.input {
  resize: vertical;
  min-height: 80px;
}

.helper-text {
  font-size: 0.85rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #4f46e5;
  color: white;
}

.btn-primary:hover {
  background-color: #4338ca;
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background-color: #4b5563;
}

.btn-danger {
  background-color: #dc2626;
  color: white;
}

.btn-danger:hover {
  background-color: #b91c1c;
}

.alert-success {
  background-color: #d1fae5;
  border: 1px solid #10b981;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  color: #065f46;
}

.info-box {
  background-color: #eff6ff;
  border-left: 4px solid #3b82f6;
  padding: 1rem;
  border-radius: 6px;
  margin-top: 1.5rem;
  color: #1e3a8a;
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid white;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
  display: inline-block;
  margin-right: 0.5rem;
}
.card-caixa-aberto {
  background-color: #f1f5f9;
  border-left: 6px solid #10b981;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  max-width: 600px;
  margin: 2rem auto;
  color: #1e293b;
}

.card-caixa-aberto p {
  margin: 0.5rem 0;
  font-size: 1rem;
}

.card-caixa-aberto .btn {
  margin-top: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}


</style>
