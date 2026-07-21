<?php

namespace App\Http\Resources;

use App\Models\DailyCheckin;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DailyCheckinResource extends JsonResource
{
	public function toArray(Request $request): array
	{
		return [
			'id' => $this->id,
			'date' => $this->date->format('Y-m-d'),
			'sleep_rating' => $this->sleep_rating,
			'sleep_level' => DailyCheckin::ratingLevel($this->sleep_rating),
			'sleep_notes' => $this->sleep_notes,
			'diet_rating' => $this->diet_rating,
			'diet_level' => DailyCheckin::ratingLevel($this->diet_rating),
			'diet_notes' => $this->diet_notes,
			'student_profile' => $this->whenLoaded('studentProfile', function () {
				return [
					'id' => $this->studentProfile->id,
					'user' => $this->studentProfile->relationLoaded('user') ? [
						'id' => $this->studentProfile->user?->id,
						'name' => $this->studentProfile->user?->name,
					] : null,
				];
			}),
			'created_at' => $this->created_at,
			'updated_at' => $this->updated_at,
		];
	}
}
