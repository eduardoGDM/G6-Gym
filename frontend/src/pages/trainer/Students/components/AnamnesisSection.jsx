import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ClipboardList,
  Images,
  Save,
  TriangleAlert,
  Video as VideoIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

import ConfirmDialog from "../../../../components/common/ConfirmDialog";
import { crudToast } from "../../../../components/common/crudToast";
import { SectionLabel } from "../../../../components/forms/SectionLabel";
import Spinner from "../../../../components/common/Spinner";
import Skeleton from "../../../../components/loading/Skeleton";
import { Button } from "../../../../components/ui/button";
import { Textarea } from "../../../../components/ui/textarea";
import studentAnamnesisService from "../../../../services/StudentAnamnesisService";
import ImageUploader from "./ImageUploader";
import PhotoGallery from "./PhotoGallery";
import PhotoViewerDialog from "./PhotoViewerDialog";
import VideoGallery from "./VideoGallery";
import VideoPlayerDialog from "./VideoPlayerDialog";
import VideoUploader from "./VideoUploader";

export default function AnamnesisSection({ studentId, readOnly = false }) {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["student-anamnesis", studentId],
    queryFn: () => studentAnamnesisService.get(studentId),
    enabled: Boolean(studentId),
  });

  const [observations, setObservations] = useState("");
  const [savingObservations, setSavingObservations] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(null);
  const [photoToDelete, setPhotoToDelete] = useState(null);
  const [deletingPhoto, setDeletingPhoto] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoViewerIndex, setVideoViewerIndex] = useState(null);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [deletingVideo, setDeletingVideo] = useState(false);

  useEffect(() => {
    setObservations(data?.observations || "");
  }, [data?.observations]);

  const photos = data?.photos || [];
  const videos = data?.videos || [];
  const isDirty = observations !== (data?.observations || "");

  // Em produção ainda não há storage persistente, então o backend recusa novos
  // envios. A tela avisa antes para o personal não escolher um arquivo à toa —
  // mídias já enviadas continuam visíveis normalmente.
  const uploadsEnabled = data?.uploads_enabled !== false;

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["student-anamnesis", studentId] });

  const handleSaveObservations = async () => {
    try {
      setSavingObservations(true);
      await crudToast(
        studentAnamnesisService.update(studentId, { observations: observations || null }),
        { action: "update", entity: "Anamnese" },
      );
      await invalidate();
    } catch {
      // erro já exibido pelo crudToast
    } finally {
      setSavingObservations(false);
    }
  };

  const handleUploadPhoto = async (file) => {
    try {
      setUploadingPhoto(true);
      await crudToast(studentAnamnesisService.addPhoto(studentId, file), {
        action: "create",
        entity: "Foto",
      });
      await invalidate();
    } catch {
      // erro já exibido pelo crudToast
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleConfirmDeletePhoto = async () => {
    if (!photoToDelete) return;

    try {
      setDeletingPhoto(true);
      await crudToast(studentAnamnesisService.removePhoto(studentId, photoToDelete.id), {
        action: "delete",
        entity: "Foto",
      });
      await invalidate();
      setPhotoToDelete(null);
    } catch {
      // erro já exibido pelo crudToast
    } finally {
      setDeletingPhoto(false);
    }
  };

  const handleUploadVideo = async (file) => {
    try {
      setUploadingVideo(true);
      await crudToast(studentAnamnesisService.addVideo(studentId, file), {
        action: "create",
        entity: "Vídeo",
      });
      await invalidate();
    } catch {
      // erro já exibido pelo crudToast
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleConfirmDeleteVideo = async () => {
    if (!videoToDelete) return;

    try {
      setDeletingVideo(true);
      await crudToast(studentAnamnesisService.removeVideo(studentId, videoToDelete.id), {
        action: "delete",
        entity: "Vídeo",
      });
      await invalidate();
      setVideoToDelete(null);
    } catch {
      // erro já exibido pelo crudToast
    } finally {
      setDeletingVideo(false);
    }
  };

  if (isError) {
    return (
      <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-border/80 bg-card/90 p-6 text-center text-sm text-muted-foreground shadow-card sm:flex-row sm:justify-center">
        Não foi possível carregar a anamnese do aluno.
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl border border-border/80 bg-card/90 shadow-card">
      <div className="flex items-center gap-2 border-b border-border/80 px-6 py-6 sm:px-8">
        <ClipboardList className="h-5 w-5 text-primary" />
        <div>
          <h2 className="text-2xl font-semibold leading-none tracking-tight">Anamnese</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Histórico, observações e acompanhamento visual da evolução do aluno.
          </p>
        </div>
      </div>

      <div className="space-y-8 px-6 py-6 sm:px-8">
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        ) : (
          <>
            <section className="space-y-3">
              <SectionLabel>Observações</SectionLabel>
              <Textarea
                rows={5}
                placeholder="Histórico médico, lesões, restrições, objetivos, medicamentos e demais informações relevantes."
                value={observations}
                disabled={readOnly}
                onChange={(event) => setObservations(event.target.value)}
              />
              {!readOnly ? (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    disabled={!isDirty || savingObservations}
                    onClick={handleSaveObservations}
                  >
                    {savingObservations ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {savingObservations ? "Salvando..." : "Salvar observações"}
                  </Button>
                </div>
              ) : !observations ? (
                <p className="text-sm text-muted-foreground">Nenhuma observação cadastrada.</p>
              ) : null}
            </section>

            {!readOnly && !uploadsEnabled ? (
              <div className="flex items-start gap-2.5 rounded-2xl border border-border/80 bg-muted/40 px-4 py-3">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-sm leading-6 text-muted-foreground">
                  {data?.uploads_disabled_message ||
                    "O envio de fotos e vídeos ainda não está disponível nesta versão. Os demais dados da anamnese são salvos normalmente."}
                </p>
              </div>
            ) : null}

            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <SectionLabel className="flex items-center gap-2">
                  <Images className="h-4 w-4" />
                  Fotos
                </SectionLabel>
                {!readOnly && uploadsEnabled ? (
                  <ImageUploader onUpload={handleUploadPhoto} uploading={uploadingPhoto} />
                ) : null}
              </div>
              <PhotoGallery
                photos={photos}
                readOnly={readOnly}
                onView={setViewerIndex}
                onDeleteRequest={setPhotoToDelete}
              />
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <SectionLabel className="flex items-center gap-2">
                  <VideoIcon className="h-4 w-4" />
                  Vídeos
                </SectionLabel>
                {!readOnly && uploadsEnabled ? (
                  <VideoUploader onUpload={handleUploadVideo} uploading={uploadingVideo} />
                ) : null}
              </div>
              <VideoGallery
                videos={videos}
                readOnly={readOnly}
                onView={setVideoViewerIndex}
                onDeleteRequest={setVideoToDelete}
              />
            </section>
          </>
        )}
      </div>

      <PhotoViewerDialog
        open={viewerIndex !== null}
        photos={photos}
        index={viewerIndex ?? 0}
        onClose={() => setViewerIndex(null)}
        onNavigate={setViewerIndex}
      />

      <ConfirmDialog
        open={Boolean(photoToDelete)}
        title="Excluir foto"
        description="Esta ação removerá a foto permanentemente. Deseja continuar?"
        variant="destructive"
        loading={deletingPhoto}
        onConfirm={handleConfirmDeletePhoto}
        onCancel={() => setPhotoToDelete(null)}
      />

      <VideoPlayerDialog
        open={videoViewerIndex !== null}
        videos={videos}
        index={videoViewerIndex ?? 0}
        onClose={() => setVideoViewerIndex(null)}
        onNavigate={setVideoViewerIndex}
      />

      <ConfirmDialog
        open={Boolean(videoToDelete)}
        title="Excluir vídeo"
        description="Esta ação removerá o vídeo permanentemente. Deseja continuar?"
        variant="destructive"
        loading={deletingVideo}
        onConfirm={handleConfirmDeleteVideo}
        onCancel={() => setVideoToDelete(null)}
      />
    </div>
  );
}
