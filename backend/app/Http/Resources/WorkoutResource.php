<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkoutResource extends JsonResource
{
	public function toArray(Request $request): array
	{
		return [
			'id' => $this->id,
			'name' => $this->name,
			'description' => $this->description,
			'start_date' => $this->start_date,
			'end_date' => $this->end_date,
			'active' => $this->active,
			'student_profile' => $this->whenLoaded('studentProfile', function () {
				return [
					'id' => $this->studentProfile->id,
					'user' => $this->studentProfile->relationLoaded('user') ? [
						'id' => $this->studentProfile->user?->id,
						'name' => $this->studentProfile->user?->name,
					] : null,
				];
			}),
			'muscle_groups' => $this->whenLoaded('muscleGroups'),
			'exercises_count' => $this->whenCounted('workoutExercises'),
			'created_at' => $this->created_at,
			'updated_at' => $this->updated_at,
		];
	}
}
