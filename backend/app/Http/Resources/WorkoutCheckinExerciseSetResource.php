<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkoutCheckinExerciseSetResource extends JsonResource
{
	public function toArray(Request $request): array
	{
		return [
			'id' => $this->id,
			'set_number' => $this->set_number,
			'planned_type' => $this->planned_type,
			'planned_repetitions' => $this->planned_repetitions,
			'planned_rir' => $this->planned_rir,
			'performed_repetitions' => $this->performed_repetitions,
			'planned_weight' => $this->planned_weight,
			'performed_weight' => $this->performed_weight,
			'planned_rest_time' => $this->planned_rest_time,
			'performed_rest_time' => $this->performed_rest_time,
			'planned_cadence' => $this->planned_cadence,
			'planned_advanced_technique' => $this->planned_advanced_technique,
			'notes' => $this->notes,
		];
	}
}
