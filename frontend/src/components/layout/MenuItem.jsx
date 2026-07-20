import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";

function isActivePath(pathname, path) {
  return pathname === path || pathname.startsWith(`${path}/`);
}

function MenuGroup({ item, onClick }) {
  const location = useLocation();
  const hasActiveChild = item.children.some((child) =>
    isActivePath(location.pathname, child.path),
  );
  const [open, setOpen] = useState(hasActiveChild);
  const Icon = item.icon;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-sm transition-all duration-200",
          hasActiveChild
            ? "border-primary/30 bg-primary/15 text-foreground shadow-[0_10px_25px_rgba(124,58,237,0.12)]"
            : "border-transparent bg-transparent text-muted-foreground hover:border-border hover:bg-accent/70 hover:text-foreground",
        )}
      >
        {Icon ? (
          <Icon
            className={cn(
              "h-4 w-4",
              hasActiveChild ? "text-primary" : "text-muted-foreground",
            )}
          />
        ) : null}
        <span className="flex-1 text-left font-medium">{item.label}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open ? "rotate-180" : "",
          )}
        />
      </button>

      {open ? (
        <div className="mt-1 ml-4 space-y-1 border-l border-border pl-3">
          {item.children.map((child) => {
            const selected = isActivePath(location.pathname, child.path);
            const ChildIcon = child.icon;

            return (
              <Link
                key={child.path}
                to={child.path}
                onClick={onClick}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-all duration-200",
                  selected
                    ? "border-primary/30 bg-primary/15 text-foreground"
                    : "border-transparent bg-transparent text-muted-foreground hover:border-border hover:bg-accent/70 hover:text-foreground",
                )}
              >
                {ChildIcon ? (
                  <ChildIcon
                    className={cn(
                      "h-3.5 w-3.5",
                      selected ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                ) : null}
                <span className="font-medium">{child.label}</span>
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default function MenuItem({ item, onClick }) {
  const location = useLocation();

  if (item.children?.length) {
    return <MenuGroup item={item} onClick={onClick} />;
  }

  const selected = isActivePath(location.pathname, item.path);
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
