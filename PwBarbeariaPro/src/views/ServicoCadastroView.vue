<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Cadastrar Serviço</h1>
    <form @submit.prevent="submitForm" class="space-y-4">
      <div>
        <label>Nome do Serviço</label>
        <input
          v-model="servico.nome"
          class="input"
          required
          placeholder="Ex: Corte de Cabelo Masculino"
          :disabled="isLoading"
        />
      </div>

      <div>
        <label>Descrição</label>
        <textarea
          v-model="servico.descricao"
          class="input"
          rows="3"
          placeholder="Descreva o serviço..."
          :disabled="isLoading"
        ></textarea>
      </div>

      <div>
        <label>Categoria</label>
        <select 
          v-model="servico.categoria" 
          class="input" 
          required
          :disabled="isLoading"
        >
          <option value="">Selecione uma categoria</option>
          <option value="Cabelo">Cabelo</option>
          <option value="Barba">Barba</option>
          <option value="Estética">Estética</option>
          <option value="Unhas">Unhas</option>
          <option value="Massagem">Massagem</option>
          <option value="Combo">Combo</option>
        </select>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label>Preço (R$)</label>
          <input
            v-model="servico.preco"
            class="input"
            type="number"
            min="0"
            step="0.01"
            required
            placeholder="0,00"
            :disabled="isLoading"
          />
        </div>

        <div>
          <label>Duração (minutos)</label>
          <input
            v-model="servico.duracao"
            class="input"
            type="number"
            min="15"
            step="15"
            required
            placeholder="60"
            :disabled="isLoading"
          />
        </div>
      </div>

      <div>
        <label>Profissionais Habilitados</label>
        <div class="space-y-2">
          <label v-for="prof in profissionaisDisponiveis" :key="prof.id" class="flex items-center">
            <input 
              type="checkbox" 
              :value="prof.id"
              v-model="servico.profissionais"
              class="mr-2"
              :disabled="isLoading"
            />
            {{ prof.nome }} - {{ prof.especialidade }}
          </label>
        </div>
        <p v-if="servico.profissionais.length === 0" class="text-yellow-600 text-sm mt-1">
          ⚠️ Selecione pelo menos um profissional
        </p>
      </div>

      <div class="flex items-center">
        <input 
          type="checkbox" 
          v-model="servico.ativo"
          class="mr-2"
          :disabled="isLoading"
        />
        <label>Serviço ativo (disponível para agendamento)</label>
      </div>

      <div class="flex gap-2">
        <button 
          class="btn" 
          type="submit"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
          {{ isLoading ? 'Cadastrando...' : 'Cadastrar' }}
        </button>
        
        <button 
          type="button" 
          class="btn-secondary"
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
import { useSweetAlert } from '@/composables/useSweetAlert'
import feather from "feather-icons";

export default defineComponent({
  name: "ServicoCadastroView",
  setup() {
    const { 
      showToast, 
      showError, 
      showSuccess, 
      showLoading, 
      hideLoading,
      confirmAction 
    } = useSweetAlert()
    
    const isLoading = ref(false)
    
    const servico = ref({
      nome: "",
      descricao: "",
      categoria: "",
      preco: "",
      duracao: "",
      profissionais: [] as number[],
      ativo: true
    });

    const profissionaisDisponiveis = ref([
      { id: 1, nome: "João Silva", especialidade: "Barbeiro" },
      { id: 2, nome: "Maria Santos", especialidade: "Cabeleireira" },
      { id: 3, nome: "Pedro Oliveira", especialidade: "Esteticista" },
    ])

    async function submitForm() {
      // Validar campos obrigatórios
      if (!servico.value.nome.trim()) {
        showError('Campo obrigatório', 'Por favor, informe o nome do serviço.')
        return
      }
      
      if (!servico.value.categoria) {
        showError('Campo obrigatório', 'Por favor, selecione uma categoria.')
        return
      }
      
      if (!servico.value.preco || parseFloat(servico.value.preco) <= 0) {
        showError('Preço inválido', 'Por favor, informe um preço válido.')
        return
      }
      
      if (!servico.value.duracao || parseInt(servico.value.duracao) < 15) {
        showError('Duração inválida', 'A duração mínima é de 15 minutos.')
        return
      }
      
      if (servico.value.profissionais.length === 0) {
        showError('Profissionais obrigatórios', 'Selecione pelo menos um profissional habilitado.')
        return
      }

      // Confirmar cadastro
      const profissionaisSelecionados = profissionaisDisponiveis.value
        .filter(p => servico.value.profissionais.includes(p.id))
        .map(p => p.nome)
        .join(', ')

      const confirmed = await confirmAction(
        'Confirmar cadastro',
        `Deseja cadastrar o serviço "${servico.value.nome}" por R$ ${servico.value.preco}?\\n\\nProfissionais: ${profissionaisSelecionados}`,
        'Sim, cadastrar'
      )
      
      if (!confirmed) return

      isLoading.value = true
      showLoading('Cadastrando serviço...')

      try {
        // Simular chamada de API
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        hideLoading()
        
        // Mostrar sucesso
        showSuccess(
          'Serviço cadastrado!',
          `"${servico.value.nome}" foi cadastrado com sucesso por R$ ${servico.value.preco}.`,
          'Continuar'
        )
        
        // Limpar formulário
        limparFormulario()
        
        // Toast de confirmação
        showToast.success('Serviço cadastrado com sucesso!')
        
      } catch (error) {
        hideLoading()
        showError('Erro no servidor', 'Ocorreu um erro ao cadastrar o serviço. Tente novamente.')
      } finally {
        isLoading.value = false
      }
    }

    function limparFormulario() {
      Object.assign(servico.value, {
        nome: "",
        descricao: "",
        categoria: "",
        preco: "",
        duracao: "",
        profissionais: [],
        ativo: true
      });
      
      showToast.info('Formulário limpo')
    }

    onMounted(() => {
      feather.replace();
    });

    return { 
      servico, 
      profissionaisDisponiveis,
      isLoading,
      submitForm,
      limparFormulario
    };
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