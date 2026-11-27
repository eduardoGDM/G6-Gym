<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Uma execução do exercício no histórico do aluno. Recebe um WorkoutCheckin cujo
 * relacionamento `exercises` já vem filtrado para o exercício consultado (0 ou 1
 * item) com suas séries carregadas. Expõe apenas os dados executados + o snapshot
 * da prescrição congelado no check-in (tipo, RIR, cadência, técnica).
 */
class ExerciseHistoryEntryResource extends JsonResource
{
	public function toArray(Request $request): array
	{
		$exercise = $this->exercises->first();

		$sets = collect($exercise?->sets ?? [])->map(fn ($set) => [
			'set_number' => $set->set_number,
			'type' => $set->planned_type,
			'performed_repetitions' => $set->performed_repetitions,
			'performed_weight' => $set->performed_weight,
			'volume' => self::volume($set->performed_weight, $set->performed_repetitions),
			'rir' => $set->planned_rir,
			'cadence' => $set->planned_cadence,
			'advanced_technique' => $set->planned_advanced_technique,
			'notes' => $set->notes,
		])->values();

		$volumes = $sets->pluck('volume')->filter(fn ($volume) => $volume !== null);

		return [
			'checkin_id' => $this->id,
			'performed_at' => $this->performed_at,
			'exercise_notes' => $exercise?->notes,
			'sets' => $sets,
			// Nulo (e não zero) quando nenhuma série tem volume: "não registrado"
			// é diferente de "moveu zero".
			'total_volume' => $volumes->isEmpty() ? null : $volumes->sum(),
		];
	}

	/**
	 * Volume de uma série: carga × repetições. Nulo quando falta qualquer um dos
	 * dois — sem os dois não há volume a reportar.
	 */
	private static function volume($weight, $repetitions): ?float
	{
		if ($weight === null || $repetitions === null) {
			return null;
		}

		return (float) $weight * (int) $repetitions;
	}
}
