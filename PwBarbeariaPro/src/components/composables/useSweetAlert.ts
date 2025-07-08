// src/composables/useSweetAlert.ts
import {
  Swal,
  Toast,
  Confirm,
  Success,
  Error,
  Warning,
} from "@/plugins/sweetalert";
import type { SweetAlertResult } from "sweetalert2";

// Interfaces para tipagem
export interface Estatisticas {
  vendas: number;
  vendasVariacao: number;
  faturamento: string;
  faturamentoVariacao: number;
  clientes: number;
  clientesVariacao: number;
  agendamentos: number;
  agendamentosPendentes: number;
}

export interface ResumoFinanceiro {
  entradas: string;
  saidas: string;
  saldo: string;
}

export interface Usuario {
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  cargo: string;
  status: string;
  avatar: string | null;
}

export interface Agendamento {
  id: number;
  cliente: string;
  servico: string;
  profissional: string;
  data: string;
  horario: string;
  valor: string;
}

export interface Pagamento {
  agendamentoId: string;
  forma: string;
  valor: string;
  status: string;
  parcelas: string;
  observacoes: string;
}

export function useSweetAlert() {
  /* ──────────────── Toasts ──────────────── */
  const showToast = {
    success: (message: string): Promise<SweetAlertResult> =>
      Toast.fire({ icon: "success", title: message }),
    error: (message: string): Promise<SweetAlertResult> =>
      Toast.fire({ icon: "error", title: message }),
    warning: (message: string): Promise<SweetAlertResult> =>
      Toast.fire({ icon: "warning", title: message }),
    info: (message: string): Promise<SweetAlertResult> =>
      Toast.fire({ icon: "info", title: message }),
  };

  /* ──────────────── Confirmações ──────────────── */
  const confirmDelete = async (
    title: string = "Tem certeza?",
    text: string = "Esta ação não pode ser desfeita!",
    confirmButtonText: string = "Sim, excluir!"
  ): Promise<boolean> => {
    const result = await Confirm.fire({
      title,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText: "Cancelar",
    });
    return result.isConfirmed;
  };

  const confirmAction = async (
    title: string,
    text: string = "",
    confirmButtonText: string = "Confirmar"
  ): Promise<boolean> => {
    const result = await Confirm.fire({
      title,
      text,
      icon: "question",
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText: "Cancelar",
    });
    return result.isConfirmed;
  };

  /**
   * Confirmação COM campo de entrada.
   * Devolve o próprio objeto `SweetAlertResult`, permitindo
   * verificar `isConfirmed` e ler `result.value`.
   */
  const confirmWithInput = (
    title: string,
    text: string = "",
    confirmButtonText: string = "Confirmar",
    inputPlaceholder: string = "",
    inputType: "text" | "email" | "password" | "number" | "tel" = "text"
  ): Promise<SweetAlertResult<any>> =>
    Swal.fire({
      title,
      text,
      input: inputType,
      inputPlaceholder,
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText: "Cancelar",
      customClass: {
        confirmButton: "btn btn-primary me-2",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
      inputValidator: (value) =>
        !value ? "Este campo é obrigatório!" : undefined,
    });

  /* ──────────────── Alertas simples ──────────────── */
  const showSuccess = (
    title: string,
    text: string = "",
    confirmButtonText: string = "OK"
  ): Promise<SweetAlertResult> => {
    return Success.fire({ title, text, confirmButtonText });
  };

  const showError = (
    title: string,
    text: string = "",
    confirmButtonText: string = "OK"
  ): Promise<SweetAlertResult> => {
    return Error.fire({ title, text, confirmButtonText });
  };

  const showWarning = (
    title: string,
    text: string = "",
    confirmButtonText: string = "OK"
  ): Promise<SweetAlertResult> => {
    return Warning.fire({ title, text, confirmButtonText });
  };

  /* ──────────────── Loading ──────────────── */
  const showLoading = (
    title: string = "Carregando..."
  ): Promise<SweetAlertResult> =>
    Swal.fire({
      title,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

  const hideLoading = (): void => Swal.close();

  /* ──────────────── (opcional) Atalho showInput ────────────────
     Continua devolvendo APENAS o valor digitado, ou null se cancelado */
  const showInput = async (
    title: string,
    inputPlaceholder: string = "",
    inputType: "text" | "email" | "password" | "number" | "tel" = "text"
  ): Promise<string | null> => {
    const result = await confirmWithInput(
      title,
      "", // sem texto adicional
      "Confirmar",
      inputPlaceholder,
      inputType
    );
    return result.isConfirmed ? result.value : null;
  };

  /* ──────────────── Export ──────────────── */
  return {
    showToast,
    confirmDelete,
    confirmAction,
    confirmWithInput, // <- NOVO
    showSuccess,
    showError,
    showWarning,
    showLoading,
    hideLoading,
    showInput, // continua disponível
    Swal, // caso precise acessar direto
  } as const;
}

// Exportar tipos para uso em outros arquivos
export type { SweetAlertResult };
