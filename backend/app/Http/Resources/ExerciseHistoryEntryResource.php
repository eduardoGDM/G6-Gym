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

		return [
			'checkin_id' => $this->id,
			'performed_at' => $this->performed_at,
			'exercise_notes' => $exercise?->notes,
			'sets' => collect($exercise?->sets ?? [])->map(fn ($set) => [
				'set_number' => $set->set_number,
				'type' => $set->planned_type,
				'performed_repetitions' => $set->performed_repetitions,
				'performed_weight' => $set->performed_weight,
				'rir' => $set->planned_rir,
				'cadence' => $set->planned_cadence,
				'advanced_technique' => $set->planned_advanced_technique,
				'notes' => $set->notes,
			])->values(),
		];
	}
}
