// src/plugins/sweetalert.ts
import Swal from 'sweetalert2'

// Configuração padrão para todos os alertas
const defaultConfig = {
  customClass: {
    confirmButton: 'btn btn-primary me-2',
    cancelButton: 'btn btn-secondary'
  },
  buttonsStyling: false,
  reverseButtons: true
}

// Toast configurado
export const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
})

// Confirmação configurada
export const Confirm = Swal.mixin({
  ...defaultConfig,
  showCancelButton: true,
  reverseButtons: true
})

// Sucesso configurado
export const Success = Swal.mixin({
  ...defaultConfig,
  icon: 'success'
})

// Erro configurado
export const Error = Swal.mixin({
  ...defaultConfig,
  icon: 'error'
})

// Warning configurado
export const Warning = Swal.mixin({
  ...defaultConfig,
  icon: 'warning'
})

// Exportar Swal original também
export { Swal }

// Exportar como default para compatibilidade
export default {
  Swal,
  Toast,
  Confirm,
  Success,
  Error,
  Warning
}

