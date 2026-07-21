<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExerciseResource extends JsonResource
{
	public function toArray(Request $request): array
	{
		return [
			'id' => $this->id,
			'muscle_group_id' => $this->muscle_group_id,
			'name' => $this->name,
			'description' => $this->description,
			'equipment' => $this->equipment,
			'video_url' => $this->video_url,
			'muscle_group' => $this->whenLoaded('muscleGroup'),
			'created_at' => $this->created_at,
			'updated_at' => $this->updated_at,
		];
	}
}
