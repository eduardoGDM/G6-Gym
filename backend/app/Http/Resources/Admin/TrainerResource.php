<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TrainerResource extends JsonResource
{
	public function toArray(Request $request): array
	{
		return [
			'id' => $this->id,
			'name' => $this->name,
			'email' => $this->email,
			'students_count' => (int) $this->students_count,
			'is_active' => (bool) $this->is_active,
			'created_at' => $this->created_at,
		];
	}
}
