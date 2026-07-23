<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlanResource extends JsonResource
{
	public function toArray(Request $request): array
	{
		return [
			'id' => $this->id,
			'code' => $this->code,
			'name' => $this->name,
			'price_cents' => $this->price_cents,
			'student_limit' => $this->student_limit,
			'features' => [
				'physical_assessment' => $this->allows_physical_assessment,
				'photos' => $this->allows_photos,
				'videos' => $this->allows_videos,
				'pdf' => $this->allows_pdf,
			],
			'sort_order' => $this->sort_order,
		];
	}
}
