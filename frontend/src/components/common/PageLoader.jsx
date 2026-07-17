import Spinner from "./Spinner";

export default function PageLoader({ label = "Carregando..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-sm text-muted-foreground animate-in fade-in duration-300">
      <Spinner className="h-6 w-6 text-primary" />
      <p>{label}</p>
    </div>
  );
}
