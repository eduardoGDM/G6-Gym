import { Card, CardContent } from "../ui/card";
import { cn } from "../../lib/utils";

export default function StatCard({
  icon: Icon,
  label,
  value,
  tone = "from-primary/30 to-primary/10",
  loading = false,
  delay = 0,
}) {
  return (
    <Card
      className="border-border/80 bg-card/80 animate-in fade-in slide-in-from-bottom-2 duration-300 transition-transform hover:-translate-y-0.5 hover:shadow-[0_16px_48px_rgba(0,0,0,0.3)]"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "backwards" }}
    >
      <CardContent className="p-5">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br",
            tone,
          )}
        >
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">{label}</p>
        {loading ? (
          <div className="mt-2 h-8 w-16 animate-pulse rounded-md bg-muted/40" />
        ) : (
          <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
