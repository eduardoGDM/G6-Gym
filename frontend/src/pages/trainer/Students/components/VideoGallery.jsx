import { PlayCircle, Trash2, Video as VideoIcon } from "lucide-react";

export default function VideoGallery({ videos, readOnly, onView, onDeleteRequest }) {
  if (!videos.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/80 py-10 text-center animate-in fade-in duration-300">
        <VideoIcon className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Nenhum vídeo cadastrado até o momento.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {videos.map((video, index) => (
        <div
          key={video.id}
          className="group relative aspect-square overflow-hidden rounded-xl border border-border/80 bg-background/60"
        >
          <button
            type="button"
            onClick={() => onView(index)}
            className="h-full w-full"
            aria-label="Reproduzir vídeo"
          >
            <video
              src={video.url}
              className="h-full w-full object-cover"
              preload="metadata"
              muted
              playsInline
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/20 text-white transition-colors group-hover:bg-black/40">
              <PlayCircle className="h-9 w-9" />
            </span>
          </button>

          {!readOnly ? (
            <button
              type="button"
              onClick={() => onDeleteRequest(video)}
              aria-label="Excluir vídeo"
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
