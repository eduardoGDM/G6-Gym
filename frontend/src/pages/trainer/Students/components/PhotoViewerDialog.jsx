import { ChevronLeft, ChevronRight } from "lucide-react";

import { Dialog, DialogCloseButton } from "../../../../components/ui/dialog";

export default function PhotoViewerDialog({ open, photos, index, onClose, onNavigate }) {
  const photo = photos[index];

  if (!open || !photo) return null;

  const hasPrev = index > 0;
  const hasNext = index < photos.length - 1;

  return (
    <Dialog open={open} onClose={onClose} className="max-w-3xl bg-background/95 p-0">
      <DialogCloseButton onClick={onClose} />

      <div className="relative flex items-center justify-center">
        {hasPrev ? (
          <button
            type="button"
            aria-label="Foto anterior"
            onClick={() => onNavigate(index - 1)}
            className="absolute left-2 z-10 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        ) : null}

        <img
          src={photo.url}
          alt="Foto ampliada da anamnese do aluno"
          className="max-h-[80vh] w-full rounded-2xl object-contain"
        />

        {hasNext ? (
          <button
            type="button"
            aria-label="Próxima foto"
            onClick={() => onNavigate(index + 1)}
            className="absolute right-2 z-10 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <p className="py-3 text-center text-xs font-medium text-muted-foreground">
        {index + 1} / {photos.length}
      </p>
    </Dialog>
  );
}
