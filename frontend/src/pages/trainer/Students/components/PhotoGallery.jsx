import { Images, Trash2 } from "lucide-react";

export default function PhotoGallery({ photos, readOnly, onView, onDeleteRequest }) {
  if (!photos.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/80 py-10 text-center animate-in fade-in duration-300">
        <Images className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Nenhuma foto cadastrada até o momento.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {photos.map((photo, index) => (
        <div
          key={photo.id}
          className="group relative aspect-square overflow-hidden rounded-xl border border-border/80 bg-background/60"
        >
          <button
            type="button"
            onClick={() => onView(index)}
            className="h-full w-full"
            aria-label="Ampliar foto"
          >
            <img
              src={photo.url}
              alt="Foto da anamnese do aluno"
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
            />
          </button>

          {!readOnly ? (
            <button
              type="button"
              onClick={() => onDeleteRequest(photo)}
              aria-label="Excluir foto"
              className="absolute right-2 top-2 rounded-lg bg-black/60 p-1.5 text-white opacity-0 transition-opacity duration-150 hover:bg-destructive group-hover:opacity-100 focus-visible:opacity-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}
