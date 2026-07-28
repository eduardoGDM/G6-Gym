<?php

namespace App\Achievements;

use App\Models\WorkoutCheckin;
use App\Models\WorkoutCheckinExercise;
use Illuminate\Support\Collection;

/**
 * Detecta recordes pessoais (PR) por exercício ao concluir um treino.
 *
 * Para cada exercício executado no check-in, compara o desempenho com a última
 * vez que o mesmo exercício foi executado pelo aluno — sempre o check-in
 * anterior mais recente daquele exercício, ignorando o próprio check-in atual e
 * independentemente do treino. Exercícios sem histórico anterior nunca contam
 * como recorde.
 *
 * O desempenho de cada execução é resumido pela MELHOR série (mesma lógica de
 * "melhor série" em todas as comparações, garantindo consistência):
 *   - bestWeight  → maior carga executada;
 *   - repsAtBest  → maior nº de repetições realizado naquela maior carga;
 *   - bestVolume  → maior (carga × repetições) de uma única série.
 *
 * É considerado recorde quando pelo menos um critério melhora. Registramos um
 * único destaque por exercício, por prioridade (carga → repetições → volume),
 * mas o payload usa um array `improvements` para permitir múltiplos critérios no
 * futuro sem quebrar o contrato.
 */
class PersonalRecordEvaluator implements AchievementEvaluator
{
	public const TYPE = 'personal_record';

	public function evaluate(WorkoutCheckin $checkin): array
	{
		$checkin->loadMissing(['exercises.sets', 'exercises.exercise.muscleGroup']);

		$exerciseIds = $checkin->exercises->pluck('exercise_id')->all();

		if (empty($exerciseIds)) {
			return [];
		}

		$previousByExercise = $this->previousExercises($checkin, $exerciseIds);

		$records = [];

		foreach ($checkin->exercises as $current) {
			$previous = $previousByExercise->get($current->exercise_id);

			if (!$previous) {
				continue;
			}

			$currentSummary = $this->summarize($current->sets);
			$previousSummary = $this->summarize($previous->sets);

			if (!$currentSummary || !$previousSummary) {
				continue;
			}

			$improvement = $this->detectImprovement($currentSummary, $previousSummary);

			if (!$improvement) {
				continue;
			}

			$records[] = [
				'type' => self::TYPE,
				'exercise' => [
					'id' => $current->exercise_id,
					'name' => $current->exercise?->name,
					'muscle_group' => $current->exercise?->muscleGroup?->name,
				],
				'improvements' => [$improvement],
			];
		}

		return $records;
	}

	/**
	 * Busca, em uma única query, a ocorrência anterior mais recente de cada
	 * exercício do check-in atual, com suas séries. Ordenamos por data (e id como
	 * desempate) do check-in pai em ordem decrescente e mantemos a primeira
	 * ocorrência por exercício — que é, portanto, a mais recente anterior à atual.
	 *
	 * @param  array<int, int>  $exerciseIds
	 * @return Collection<int, WorkoutCheckinExercise>  indexada por exercise_id
	 */
	private function previousExercises(WorkoutCheckin $checkin, array $exerciseIds): Collection
	{
		return WorkoutCheckinExercise::query()
			->select('workout_checkin_exercises.*')
			->join('workout_checkins as wc', 'wc.id', '=', 'workout_checkin_exercises.workout_checkin_id')
			->where('wc.student_profile_id', $checkin->student_profile_id)
			->whereIn('workout_checkin_exercises.exercise_id', $exerciseIds)
			->where(function ($query) use ($checkin) {
				$query->where('wc.performed_at', '<', $checkin->performed_at)
					->orWhere(function ($tie) use ($checkin) {
						$tie->where('wc.performed_at', '=', $checkin->performed_at)
							->where('wc.id', '<', $checkin->id);
					});
			})
			->with('sets')
			->orderByDesc('wc.performed_at')
			->orderByDesc('wc.id')
			->get()
			->unique('exercise_id')
			->keyBy('exercise_id');
	}

	/**
	 * Resume as séries executadas pela melhor série. Retorna null quando não há
	 * nenhuma série com carga e repetições preenchidas (execução sem dados
	 * comparáveis).
	 *
	 * A carga é normalizada para centavos (inteiro) apenas nas comparações, para
	 * não sofrer com o arredondamento de ponto flutuante do cast decimal:2.
	 *
	 * @return array{weight: float, weightCents: int, repsAtBest: int, volume: float, volumeCents: int}|null
	 */
	private function summarize($sets): ?array
	{
		$valid = collect($sets)->filter(
			fn ($set) => $set->performed_weight !== null && $set->performed_repetitions !== null
		);

		if ($valid->isEmpty()) {
			return null;
		}

		$bestWeight = $valid->max(fn ($set) => (float) $set->performed_weight);
		$bestWeightCents = (int) round($bestWeight * 100);

		$repsAtBest = $valid
			->filter(fn ($set) => (int) round(((float) $set->performed_weight) * 100) === $bestWeightCents)
			->max(fn ($set) => (int) $set->performed_repetitions);

		$bestVolume = $valid->max(
			fn ($set) => ((float) $set->performed_weight) * ((int) $set->performed_repetitions)
		);

		return [
			'weight' => $bestWeight,
			'weightCents' => $bestWeightCents,
			'repsAtBest' => (int) $repsAtBest,
			'volume' => $bestVolume,
			'volumeCents' => (int) round($bestVolume * 100),
		];
	}

	/**
	 * Aplica a prioridade carga → repetições (na mesma carga) → volume e devolve o
	 * primeiro critério que melhorou, ou null se nenhum melhorou.
	 *
	 * @return array{metric: string, previous: float|int, current: float|int, delta: float|int, unit: ?string}|null
	 */
	private function detectImprovement(array $current, array $previous): ?array
	{
		if ($current['weightCents'] > $previous['weightCents']) {
			return [
				'metric' => 'weight',
				'previous' => $previous['weight'],
				'current' => $current['weight'],
				'delta' => round($current['weight'] - $previous['weight'], 2),
				'unit' => 'kg',
			];
		}

		if (
			$current['weightCents'] === $previous['weightCents']
			&& $current['repsAtBest'] > $previous['repsAtBest']
		) {
			return [
				'metric' => 'reps',
				'previous' => $previous['repsAtBest'],
				'current' => $current['repsAtBest'],
				'delta' => $current['repsAtBest'] - $previous['repsAtBest'],
				'unit' => null,
			];
		}

		if ($current['volumeCents'] > $previous['volumeCents']) {
			return [
				'metric' => 'volume',
				'previous' => round($previous['volume'], 2),
				'current' => round($current['volume'], 2),
				'delta' => round($current['volume'] - $previous['volume'], 2),
				'unit' => 'kg',
			];
		}

		return null;
	}
}
