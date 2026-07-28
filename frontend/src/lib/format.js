// Converte uma data ISO (ou datetime ISO) para o formato brasileiro dd/mm/aaaa.
//
// - fallback: valor devolvido quando a data está vazia. Padrão "—"; passe `null`
//   para esconder o elemento condicionalmente ({data ? ... : null}).
// - Um valor que não seja ISO volta intacto, sem quebrar em "undefined/undefined".
export const formatDate = (value, fallback = "—") => {
  if (!value) return fallback;

  const [year, month, day] = value.slice(0, 10).split("-");
  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
};
