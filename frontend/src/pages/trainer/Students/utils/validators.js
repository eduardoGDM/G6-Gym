/**
 * CPF com dígito verificador.
 *
 * O CPF é a chave da vaga do plano (uma vaga = um CPF distinto), então um CPF
 * inventado vira vaga fantasma. Espelha a validação do backend
 * (`StudentProfileController::isValidCpf`) para o erro aparecer antes do submit.
 */
export const isValidCpf = (value) => {
  const digits = String(value || "").replace(/\D/g, "");

  // Sequências repetidas passam no cálculo, mas não são CPFs válidos.
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) {
    return false;
  }

  return [9, 10].every((position) => {
    let sum = 0;

    for (let i = 0; i < position; i++) {
      sum += Number(digits[i]) * (position + 1 - i);
    }

    return ((sum * 10) % 11) % 10 === Number(digits[position]);
  });
};

export const isNotInFuture = (value) => {
  if (!value) return true;
  const date = new Date(`${value}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date <= today;
};
