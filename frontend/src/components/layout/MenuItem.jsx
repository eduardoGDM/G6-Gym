import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";

export default function MenuItem({ item, onClick }) {
  const location = useLocation();
  const selected =
    location.pathname === item.path ||
    location.pathname.startsWith(`${item.path}/`);

  const Icon = item.icon;

  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-sm transition-all duration-200",
        selected
          ? "border-primary/30 bg-primary/15 text-foreground shadow-[0_10px_25px_rgba(124,58,237,0.12)]"
          : "border-transparent bg-transparent text-muted-foreground hover:border-border hover:bg-accent/70 hover:text-foreground",
      )}
    >
      {Icon ? (
        <Icon className={cn("h-4 w-4", selected ? "text-primary" : "text-muted-foreground")} />
      ) : null}
      <span className="font-medium">{item.label}</span>
    </Link>
  );
}
