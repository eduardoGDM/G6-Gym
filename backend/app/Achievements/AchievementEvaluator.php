<?php

namespace App\Achievements;

use App\Models\WorkoutCheckin;

/**
 * Contrato de um avaliador de conquistas.
 *
 * Cada avaliador analisa um check-in já concluído e devolve zero ou mais
 * conquistas normalizadas. Novos tipos de conquista (maior sequência de
 * treinos, recorde semanal, etc.) só precisam implementar esta interface e ser
 * registrados na lista de avaliadores do AchievementController — nada no fluxo
 * de conclusão do treino muda.
 *
 * O formato de retorno é um array de arrays associativos; cada conquista deve
 * conter ao menos a chave 'type' identificando o avaliador de origem.
 *
 * @return array<int, array<string, mixed>>
 */
interface AchievementEvaluator
{
	public function evaluate(WorkoutCheckin $checkin): array;
}
