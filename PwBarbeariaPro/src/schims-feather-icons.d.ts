// src/shims-feather-icons.d.ts
declare module "feather-icons" {
  interface Feather {
    /**
     * Substitui <i data-feather="..."> por SVGs inline.
     * Você pode passar atributos extras, se quiser.
     */
    replace(attrs?: Record<string, any>): void;
  }
  const feather: Feather;
  export default feather;
}
