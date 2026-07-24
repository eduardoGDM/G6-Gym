import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";

// Base compartilhada por todos os itens (pai, grupo e filho) para garantir
// mesma altura, padding, raio e estados de hover/active/focus.
// `relative` + `before:` desenham o indicador lateral vermelho do item ativo.
const ITEM_BASE =
  "relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-card before:absolute before:left-0 before:top-1/2 before:h-5 before:w-[3px] before:-translate-y-1/2 before:rounded-r-full before:transition-colors";

const ITEM_ACTIVE =
  "bg-primary/15 text-foreground before:bg-primary";

const ITEM_IDLE =
  "bg-transparent text-muted-foreground before:bg-transparent hover:bg-accent/70 hover:text-foreground";

function isActivePath(pathname, path, end = false) {
  if (end) return pathname === path;
  return pathname === path || pathname.startsWith(`${path}/`);
}

function ItemIcon({ Icon, active }) {
  if (!Icon) return null;
  return (
    <Icon
      className={cn(
        "h-[18px] w-[18px] shrink-0",
        active ? "text-primary" : "text-muted-foreground",
      )}
    />
  );
}

function MenuGroup({ item, onClick }) {
  const location = useLocation();
  const hasActiveChild = item.children.some((child) =>
    isActivePath(location.pathname, child.path, child.end),
  );
  const [open, setOpen] = useState(hasActiveChild);
  const Icon = item.icon;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className={cn(ITEM_BASE, hasActiveChild ? ITEM_ACTIVE : ITEM_IDLE)}
      >
        <ItemIcon Icon={Icon} active={hasActiveChild} />
        <span className="flex-1 text-left">{item.label}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open ? "rotate-180" : "",
          )}
        />
      </button>

      {open ? (
        <div className="mt-1.5 ml-4 space-y-1.5 border-l border-border pl-3">
          {item.children.map((child) => {
            const selected = isActivePath(
              location.pathname,
              child.path,
              child.end,
            );

            return (
              <Link
                key={child.path}
                to={child.path}
                onClick={onClick}
                className={cn(ITEM_BASE, selected ? ITEM_ACTIVE : ITEM_IDLE)}
              >
                <ItemIcon Icon={child.icon} active={selected} />
                <span className="flex-1 text-left">{child.label}</span>
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

  const selected = isActivePath(location.pathname, item.path, item.end);

  return (
    <Link
      to={item.path}
      onClick={onClick}
      aria-current={selected ? "page" : undefined}
      className={cn(ITEM_BASE, selected ? ITEM_ACTIVE : ITEM_IDLE)}
    >
      <ItemIcon Icon={item.icon} active={selected} />
      <span className="flex-1 text-left">{item.label}</span>
    </Link>
  );
}
