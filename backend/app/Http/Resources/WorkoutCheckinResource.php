<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkoutCheckinResource extends JsonResource
{
	public function toArray(Request $request): array
	{
		return [
			'id' => $this->id,
			'workout_id' => $this->workout_id,
			'performed_at' => $this->performed_at,
			'notes' => $this->notes,
			'workout' => $this->whenLoaded('workout', function () {
				return [
					'id' => $this->workout->id,
					'name' => $this->workout->name,
					'trainer' => $this->workout->relationLoaded('trainer') ? [
						'id' => $this->workout->trainer?->id,
						'name' => $this->workout->trainer?->name,
					] : null,
				];
			}),
			'student_profile' => $this->whenLoaded('studentProfile', function () {
				return [
					'id' => $this->studentProfile->id,
					'user' => $this->studentProfile->relationLoaded('user') ? [
						'id' => $this->studentProfile->user?->id,
						'name' => $this->studentProfile->user?->name,
					] : null,
				];
			}),
			'exercises' => WorkoutCheckinExerciseResource::collection($this->whenLoaded('exercises')),
			'exercises_count' => $this->whenCounted('exercises'),
			'created_at' => $this->created_at,
			'updated_at' => $this->updated_at,
		];
	}
}
