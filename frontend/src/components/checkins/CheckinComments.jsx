import { MessageSquare, Pencil, Send, Trash2, X } from "lucide-react";
import { useState } from "react";

import { crudToast } from "../common/crudToast";
import Spinner from "../common/Spinner";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Textarea } from "../ui/textarea";

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Thread de comentários do personal em um check-in.
 *
 * - readOnly (aluno): só lê a conversa; quando não há comentário, não renderiza nada.
 * - trainer: lê, escreve, edita e remove os próprios comentários.
 *
 * As ações são passadas pelo pai (onCreate/onUpdate/onDelete devolvem Promise) e,
 * após cada sucesso, onChanged() é chamado para o pai recarregar o check-in.
 */
export default function CheckinComments({
  comments = [],
  readOnly = false,
  onCreate,
  onUpdate,
  onDelete,
  onChanged,
}) {
  const [body, setBody] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editBody, setEditBody] = useState("");
  const [busyId, setBusyId] = useState(null);

  const hasComments = comments.length > 0;

  if (readOnly && !hasComments) {
    return null;
  }

  const handleCreate = async () => {
    const text = body.trim();
    if (!text) return;

    setCreating(true);
    try {
      await crudToast(onCreate(text), { action: "create", entity: "Comentário" });
      setBody("");
      await onChanged?.();
    } catch {
      // erro já exibido pelo crudToast
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (comment) => {
    setEditingId(comment.id);
    setEditBody(comment.body);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditBody("");
  };

  const handleUpdate = async (id) => {
    const text = editBody.trim();
    if (!text) return;

    setBusyId(id);
    try {
      await crudToast(onUpdate(id, text), { action: "update", entity: "Comentário" });
      cancelEdit();
      await onChanged?.();
    } catch {
      // erro já exibido pelo crudToast
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id) => {
    setBusyId(id);
    try {
      await crudToast(onDelete(id), { action: "delete", entity: "Comentário" });
      if (editingId === id) cancelEdit();
      await onChanged?.();
    } catch {
      // erro já exibido pelo crudToast
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Card className="border-border/80 bg-card/80">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <p className="font-semibold text-foreground">
            {readOnly ? "Comentários do seu personal" : "Comentários para o aluno"}
          </p>
        </div>

        {hasComments ? (
          <ul className="space-y-3">
            {comments.map((comment) => {
              const isEditing = editingId === comment.id;
              const isBusy = busyId === comment.id;

              return (
                <li
                  key={comment.id}
                  className="rounded-xl border border-border/60 bg-background/40 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">
                      {comment.trainer?.name || "Personal"}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(comment.created_at)}
                    </span>
                  </div>

                  {isEditing ? (
                    <div className="mt-3 space-y-3">
                      <Textarea
                        value={editBody}
                        onChange={(event) => setEditBody(event.target.value)}
                        rows={3}
                        maxLength={2000}
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleUpdate(comment.id)}
                          disabled={isBusy || !editBody.trim()}
                        >
                          {isBusy ? <Spinner className="h-4 w-4" /> : null}
                          Salvar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEdit}
                          disabled={isBusy}
                        >
                          <X className="h-4 w-4" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="mt-2 whitespace-pre-line text-sm text-foreground/90">
                        {comment.body}
                      </p>

                      {!readOnly ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(comment)}
                            disabled={isBusy}
                          >
                            <Pencil className="h-4 w-4" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(comment.id)}
                            disabled={isBusy}
                          >
                            {isBusy ? (
                              <Spinner className="h-4 w-4" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            Excluir
                          </Button>
                        </div>
                      ) : null}
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nenhum comentário ainda. Escreva abaixo para acompanhar o aluno.
          </p>
        )}

        {!readOnly ? (
          <div className="space-y-3 border-t border-border/80 pt-4">
            <Textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Escreva um comentário para o aluno..."
              rows={3}
              maxLength={2000}
            />
            <div className="flex justify-end">
              <Button onClick={handleCreate} disabled={creating || !body.trim()}>
                {creating ? <Spinner className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                Enviar comentário
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
