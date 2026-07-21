// Configuração centralizada da API.
//
// A origem do backend vem de variáveis de ambiente do Vite (import.meta.env).
// Nunca deixar URLs hardcoded espalhadas pelo código: qualquer novo endpoint
// deve derivar de API_BASE_URL / CSRF_COOKIE_URL.
//
// VITE_API_URL pode ser informada como a origem (http://localhost:8000) ou já
// com o sufixo /api (http://localhost:8000/api) — ambos são normalizados aqui.
const rawApiUrl = (import.meta.env.VITE_API_URL ?? "http://localhost:8000")
  .trim()
  .replace(/\/+$/, "");

const API_ORIGIN = rawApiUrl.replace(/\/api$/, "");

export const API_BASE_URL = `${API_ORIGIN}/api`;

// Endpoint do Sanctum para emissão do cookie CSRF (fora do prefixo /api).
export const CSRF_COOKIE_URL = `${API_ORIGIN}/sanctum/csrf-cookie`;

// Timeout padrão das requisições HTTP (ms). Configurável via ambiente.
export const REQUEST_TIMEOUT = Number(
  import.meta.env.VITE_REQUEST_TIMEOUT ?? 30000,
);
