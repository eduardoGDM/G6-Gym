import { ImagePlus } from "lucide-react";
import { useRef } from "react";
import toast from "react-hot-toast";

import Spinner from "../../../../components/common/Spinner";
import { Button } from "../../../../components/ui/button";

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export default function ImageUploader({ onUpload, uploading }) {
  const inputRef = useRef(null);

  const handleChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Formato inválido. Envie uma imagem JPG, JPEG, PNG ou WEBP.");
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      toast.error("A foto deve ter no máximo 5MB.");
      return;
    }

    onUpload(file);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={handleChange}
      />
      <Button
        type="button"
        variant="outline"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <Spinner className="h-4 w-4" />
        ) : (
          <ImagePlus className="h-4 w-4" />
        )}
        {uploading ? "Enviando..." : "Adicionar foto"}
      </Button>
    </>
  );
}
