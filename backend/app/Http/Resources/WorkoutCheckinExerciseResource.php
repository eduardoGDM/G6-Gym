<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkoutCheckinExerciseResource extends JsonResource
{
	public function toArray(Request $request): array
	{
		return [
			'id' => $this->id,
			'exercise_id' => $this->exercise_id,
			'notes' => $this->notes,
			'exercise' => $this->whenLoaded('exercise', function () {
				return [
					'id' => $this->exercise->id,
					'name' => $this->exercise->name,
					'muscle_group' => $this->exercise->relationLoaded('muscleGroup') ? $this->exercise->muscleGroup : null,
				];
			}),
			'sets' => WorkoutCheckinExerciseSetResource::collection($this->whenLoaded('sets')),
			'created_at' => $this->created_at,
			'updated_at' => $this->updated_at,
		];
	}
}
