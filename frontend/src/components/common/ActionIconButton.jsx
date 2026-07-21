import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Tooltip } from "../ui/tooltip";
import Spinner from "./Spinner";

export default function ActionIconButton({
  icon: Icon,
  tooltip,
  onClick,
  color = "outline",
  disabled = false,
  loading = false,
  className,
}) {
  return (
    <Tooltip label={tooltip}>
      <Button
        type="button"
        variant={color}
        aria-label={tooltip}
        disabled={disabled || loading}
        onClick={onClick}
        className={cn("h-10 w-10 shrink-0 rounded-lg p-0", className)}
      >
        {loading ? (
          <Spinner className="h-4 w-4" />
        ) : (
          <Icon className="h-4 w-4" aria-hidden="true" />
        )}
      </Button>
    </Tooltip>
  );
}
