<template>
  <div class="p-6 max-w-xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Fechar Caixa</h1>

    <div v-if="!caixaAberto" class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
      <strong>⚠️ Nenhum caixa aberto!</strong>
      <p>É necessário abrir um caixa antes de fechá-lo.</p>
      <button class="btn mt-2" @click="$router.push('/caixa/abrir')">
        Abrir Caixa
      </button>
    </div>

    <div v-else>
      <div class="bg-blue-50 p-4 rounded mb-4">
        <h3 class="font-semibold text-blue-800 mb-2">📊 Resumo do Caixa</h3>
        <div class="text-blue-700 space-y-1">
          <p><strong>Saldo Inicial:</strong> R$ {{ saldoInicial.toFixed(2) }}</p>
          <p><strong>Total Entradas:</strong> R$ {{ entradas.toFixed(2) }}</p>
          <p><strong>Total Saídas:</strong> R$ {{ saidas.toFixed(2) }}</p>
          <p><strong>Saldo Esperado:</strong> R$ {{ saldoEsperado.toFixed(2) }}</p>
        </div>
      </div>

      <form @submit.prevent="fecharCaixa" class="space-y-4">
        <div>
          <label>Saldo Final Contado (R$)</label>
          <input
            type="number"
            v-model.number="saldoFinal"
            step="0.01"
            class="input"
            required
            placeholder="0,00"
            :disabled="isLoading"
          />
          <small class="text-gray-600">Digite o valor em dinheiro contado no caixa</small>
        </div>

        <div v-if="saldoFinal > 0" class="bg-gray-50 p-3 rounded">
          <p class="font-semibold">Diferença: 
            <span :class="divergencia >= 0 ? 'text-green-600' : 'text-red-600'">
              R$ {{ Math.abs(divergencia).toFixed(2) }} 
              {{ divergencia >= 0 ? '(sobra)' : '(falta)' }}
            </span>
          </p>
        </div>

        <div v-if="Math.abs(divergencia) > 0.01 && saldoFinal > 0">
          <label>Justificativa da Divergência</label>
          <textarea 
            v-model="justificativa" 
            class="input" 
            rows="3"
            required
            placeholder="Explique o motivo da diferença entre o saldo esperado e o contado"
            :disabled="isLoading"
          ></textarea>
        </div>

        <div>
          <label>Observações Finais</label>
          <textarea 
            v-model="observacoes" 
            class="input" 
            rows="2"
            placeholder="Observações sobre o fechamento (opcional)"
            :disabled="isLoading"
          ></textarea>
        </div>

        <div class="bg-red-50 p-4 rounded">
          <h3 class="font-semibold text-red-800 mb-2">⚠️ Atenção</h3>
          <ul class="text-red-700 text-sm space-y-1">
            <li>• Esta ação não pode ser desfeita</li>
            <li>• Confira o saldo contado antes de confirmar</li>
            <li>• Justifique divergências acima de R$ 0,01</li>
            <li>• O caixa será fechado definitivamente</li>
          </ul>
        </div>

        <div class="flex gap-2">
          <button 
            class="btn" 
            type="submit"
            :disabled="isLoading || saldoFinal <= 0"
          >
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
            {{ isLoading ? 'Fechando...' : 'Fechar Caixa' }}
          </button>
          
          <button 
            type="button" 
            class="btn-secondary"
            @click="cancelar"
            :disabled="isLoading"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import { useRouter } from 'vue-router'
import { useSweetAlert } from '@/composables/useSweetAlert'
import feather from "feather-icons";

export default defineComponent({
  name: "FecharCaixaView",
  setup() {
    const router = useRouter()
    const { 
      showToast, 
      showError, 
      showSuccess, 
      showLoading, 
      hideLoading,
      confirmAction,
      Swal
    } = useSweetAlert()
    
    const isLoading = ref(false)
    const caixaAberto = ref(true) // Simular caixa aberto

    // Dados simulados do caixa
    const saldoInicial = ref(100.00)
    const entradas = ref(850.00)
    const saidas = ref(120.00)
    
    const saldoFinal = ref(0)
    const justificativa = ref("")
    const observacoes = ref("")

    const saldoEsperado = computed(() => saldoInicial.value + entradas.value - saidas.value)
    const divergencia = computed(() => saldoFinal.value - saldoEsperado.value)

    async function fecharCaixa() {
      // Validações
      if (saldoFinal.value <= 0) {
        showError('Saldo inválido', 'Por favor, informe o saldo final contado.')
        return
      }

      if (Math.abs(divergencia.value) > 0.01 && !justificativa.value.trim()) {
        showError('Justificativa obrigatória', 'Por favor, justifique a divergência encontrada.')
        return
      }

      // Mostrar resumo antes de confirmar
      const resumoHtml = `
        <div class="text-left">
          <p><strong>Saldo Inicial:</strong> R$ ${saldoInicial.value.toFixed(2)}</p>
          <p><strong>Total Entradas:</strong> R$ ${entradas.value.toFixed(2)}</p>
          <p><strong>Total Saídas:</strong> R$ ${saidas.value.toFixed(2)}</p>
          <p><strong>Saldo Esperado:</strong> R$ ${saldoEsperado.value.toFixed(2)}</p>
          <p><strong>Saldo Contado:</strong> R$ ${saldoFinal.value.toFixed(2)}</p>
          <hr class="my-2">
          <p><strong>Diferença:</strong> 
            <span style="color: ${divergencia.value >= 0 ? 'green' : 'red'}">
              R$ ${Math.abs(divergencia.value).toFixed(2)} 
              ${divergencia.value >= 0 ? '(sobra)' : '(falta)'}
            </span>
          </p>
          ${justificativa.value ? `<p><strong>Justificativa:</strong> ${justificativa.value}</p>` : ''}
        </div>
      `

      const confirmed = await Swal.fire({
        title: 'Confirmar fechamento do caixa',
        html: resumoHtml,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, fechar caixa',
        cancelButtonText: 'Cancelar',
        customClass: {
          confirmButton: 'btn btn-danger me-2',
          cancelButton: 'btn btn-secondary'
        },
        buttonsStyling: false,
        reverseButtons: true
      })

      if (!confirmed.isConfirmed) return

      isLoading.value = true
      showLoading('Fechando caixa...')

      try {
        // Simular chamada de API
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        hideLoading()
        
        // Mostrar resultado do fechamento
        await showSuccess(
          'Caixa fechado com sucesso!',
          `O caixa foi fechado em ${new Date().toLocaleString('pt-BR')}.\\n\\nDiferença: R$ ${Math.abs(divergencia.value).toFixed(2)} ${divergencia.value >= 0 ? '(sobra)' : '(falta)'}`,
          'Continuar'
        )
        
        // Simular fechamento do caixa
        caixaAberto.value = false
        
        showToast.success('Caixa fechado com sucesso!')
        
        // Redirecionar para consulta
        router.push('/caixa/consulta')
        
      } catch (error) {
        hideLoading()
        showError('Erro no servidor', 'Ocorreu um erro ao fechar o caixa. Tente novamente.')
      } finally {
        isLoading.value = false
      }
    }

    function cancelar() {
      router.push('/caixa/consulta')
    }

    onMounted(() => {
      feather.replace()
      
      // Simular verificação de caixa aberto
      const caixaExistente = localStorage.getItem('caixaAberto')
      if (!caixaExistente) {
        caixaAberto.value = false
      }
    })

    return {
      caixaAberto,
      saldoInicial,
      entradas,
      saidas,
      saldoEsperado,
      saldoFinal,
      divergencia,
      justificativa,
      observacoes,
      isLoading,
      fecharCaixa,
      cancelar
    }
  },
});
</script>

<style scoped>
.input {
  border: 1px solid #ccc;
  border-radius: 4px;
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
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-secondary {
  background-color: #6b7280;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
}
.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
textarea.input {
  resize: vertical;
  min-height: 80px;
}
</style>