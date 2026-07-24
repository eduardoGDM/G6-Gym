import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import dailyCheckinsService from "../../services/DailyCheckinsService";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

export default function DailyCheckinReminder() {
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ["student-daily-checkin-reminder"],
    queryFn: () => dailyCheckinsService.reminder(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  });

  if (!data?.pending || dismissed) {
    return null;
  }

  return (
    <Card className="mt-4 mb-6 border-primary/40 bg-card/95 animate-in fade-in slide-in-from-top-4 duration-300 lg:mt-6">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-foreground">
              ⚠️ Check-in Diário Pendente
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Você ainda não registrou como foi seu dia de ontem. Essas
              informações ajudam seu Personal Trainer a acompanhar sua
              evolução e permitem gerar análises mais precisas sobre seu
              desempenho.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
          >
            Lembrar depois
          </Button>
          <Button size="sm" onClick={() => navigate("/student/daily-checkins")}>
            Realizar Check-in
          </Button>
        </div>
      </div>
    </Card>
  );
}
