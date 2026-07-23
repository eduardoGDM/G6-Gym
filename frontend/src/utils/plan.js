/**
 * Helpers de exibição de plano, compartilhados entre o painel do admin e o
 * card do personal.
 */

export const formatPlanPrice = (priceCents) => {
  if (!priceCents) return "Grátis";

  return (priceCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

/** "12/15" ou "12/∞" quando o plano não tem teto. */
export const formatUsage = (used, limit) =>
  `${used ?? 0}/${limit === null || limit === undefined ? "∞" : limit}`;

/**
 * Um personal acima do limite do plano não é bloqueado (não existe gate), mas
 * precisa ficar visível: é o dado que valida se a escada está bem calibrada.
 */
export const isOverLimit = (used, limit) =>
  limit !== null && limit !== undefined && (used ?? 0) > limit;
