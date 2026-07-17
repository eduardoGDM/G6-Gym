import toast from "react-hot-toast";

const ACTION_MESSAGES = {
  create: {
    loading: (entity) => `Criando ${entity}...`,
    success: (entity) => `${entity} criado com sucesso`,
    error: (entity) => `Erro ao criar ${entity}`,
  },
  update: {
    loading: (entity) => `Salvando ${entity}...`,
    success: (entity) => `${entity} atualizado com sucesso`,
    error: (entity) => `Erro ao atualizar ${entity}`,
  },
  delete: {
    loading: (entity) => `Excluindo ${entity}...`,
    success: (entity) => `${entity} removido com sucesso`,
    error: (entity) => `Erro ao excluir ${entity}`,
  },
};

/**
 * Exibe um toast de loading -> sucesso/erro para uma operação de CRUD.
 * Reutilizável em qualquer entidade (alunos, exercícios, treinos, etc).
 *
 * @param {Promise} promise - a chamada à API (ex: studentsService.create(payload))
 * @param {"create"|"update"|"delete"} action
 * @param {string} entity - nome da entidade em português (ex: "Aluno", "Exercício")
 * @param {(error: unknown) => void} [onError] - callback opcional para tratar erros (ex: setError de formulário)
 */
export function crudToast(promise, { action, entity, onError }) {
  const messages = ACTION_MESSAGES[action];

  return toast.promise(promise, {
    loading: messages.loading(entity),
    success: messages.success(entity),
    error: (error) => {
      onError?.(error);
      return error.response?.data?.message || messages.error(entity);
    },
  });
}
