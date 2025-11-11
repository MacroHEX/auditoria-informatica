/// <reference types="vite/client" />

// PUNTO DE AUDITORIA (Identify):
// Definiciones de tipo para el entorno de Vite
// Mejora el autocompletado y la detección de errores

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_SOCKET_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}