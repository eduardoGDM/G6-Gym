import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BedDouble, Salad } from "lucide-react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

import PageContainer from "../../../components/common/PageContainer";
import PageTitle from "../../../components/common/PageTitle";
import DetailsSkeleton from "../../../components/loading/DetailsSkeleton";
import ErrorState from "../../../components/loading/ErrorState";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import trainerDailyCheckinsService from "../../../services/TrainerDailyCheckinsService";

const formatDate = (value) => {
  if (!value) return "-";
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
};

export default function DailyCheckinsShow() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: checkin, isLoading, isError, refetch } = useQuery({
    queryKey: ["trainer-daily-checkin", id],
    queryFn: () => trainerDailyCheckinsService.getById(id),
  });

  useEffect(() => {
    if (isError) {
      toast.error("Não foi possível carregar o check-in.");
    }
  }, [isError]);

  return (
    <PageContainer>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <PageTitle
          eyebrow="Check-ins de Dieta e Sono"
          title={checkin?.student_profile?.user?.name || "Detalhes do check-in"}
          description={checkin ? `Avaliado em ${formatDate(checkin.date)}` : ""}
        />

        <Button
          variant="outline"
          className="w-full md:w-auto"
          onClick={() => navigate("/trainer/checkins/daily")}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar à lista
        </Button>
      </div>

      {isLoading ? (
        <Card className="border-border/80 bg-card/80">
          <CardContent className="p-6">
            <DetailsSkeleton blocks={2} linesPerBlock={1} />
          </CardContent>
        </Card>
      ) : isError ? (
        <Card className="border-border/80 bg-card/80">
          <CardContent>
            <ErrorState onRetry={refetch} />
          </CardContent>
        </Card>
      ) : !checkin ? (
        <Card className="border-border/80 bg-card/80">
          <CardContent className="p-6">
            <p className="font-semibold">Check-in não encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="border-border/80 bg-card/80">
            <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Aluno
                </p>
                <p className="mt-1 font-semibold text-foreground">
                  {checkin.student_profile?.user?.name || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Data avaliada
                </p>
                <p className="mt-1 font-semibold text-foreground">
                  {formatDate(checkin.date)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card/80">
            <CardContent className="space-y-3 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <BedDouble className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">Sono</p>
                  <Badge variant="outline">Nota {checkin.sleep_rating}</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {checkin.sleep_notes || "Nenhuma observação registrada."}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card/80">
            <CardContent className="space-y-3 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Salad className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">Dieta</p>
                  <Badge variant="outline">Nota {checkin.diet_rating}</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {checkin.diet_notes || "Nenhuma observação registrada."}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
