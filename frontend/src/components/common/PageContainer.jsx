import { cn } from "../../lib/utils";

/**
 * Faixa de conteúdo de uma tela.
 *
 * O gutter lateral vive aqui e **só** aqui: o `<main>` do `RoleLayout` não tem
 * padding horizontal, senão os dois se somam e o mobile perde 32px de cada
 * lado. `px-4` é o gutter de 16px que o conteúdo precisa em 360px.
 */
export default function PageContainer({ children, className = "" }) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1600px] px-4 pt-2 pb-6 sm:px-6 lg:px-8 lg:pt-3 lg:pb-8 animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out",
        className,
      )}
    >
      {children}
    </div>
  );
}
