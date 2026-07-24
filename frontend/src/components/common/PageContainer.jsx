import { cn } from "../../lib/utils";

export default function PageContainer({ children, className = "" }) {
  return (
    <main
      className={cn(
        "mx-auto w-full max-w-[1600px] px-4 pt-2 pb-6 sm:px-6 lg:px-6 lg:pt-3 lg:pb-8 animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out",
        className,
      )}
    >
      {children}
    </main>
  );
}
