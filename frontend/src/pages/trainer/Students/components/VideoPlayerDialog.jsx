import { ChevronLeft, ChevronRight } from "lucide-react";

import { Dialog, DialogCloseButton } from "../../../../components/ui/dialog";

export default function VideoPlayerDialog({ open, videos, index, onClose, onNavigate }) {
  const video = videos[index];

  if (!open || !video) return null;

  const hasPrev = index > 0;
  const hasNext = index < videos.length - 1;

  return (
    <Dialog open={open} onClose={onClose} className="max-w-3xl bg-background/95 p-0">
      <DialogCloseButton onClick={onClose} />

      <div className="relative flex items-center justify-center">
        {hasPrev ? (
          <button
            type="button"
            aria-label="Vídeo anterior"
            onClick={() => onNavigate(index - 1)}
            className="absolute left-2 z-10 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        ) : null}

        <video
          key={video.id}
          src={video.url}
          controls
          autoPlay
          className="max-h-[80vh] w-full rounded-2xl bg-black object-contain"
        >
          Seu navegador não suporta a reprodução deste vídeo.
        </video>

        {hasNext ? (
          <button
            type="button"
            aria-label="Próximo vídeo"
            onClick={() => onNavigate(index + 1)}
            className="absolute right-2 z-10 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <p className="py-3 text-center text-xs font-medium text-muted-foreground">
        {index + 1} / {videos.length}
      </p>
    </Dialog>
  );
}
