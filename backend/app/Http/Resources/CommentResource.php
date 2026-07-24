<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommentResource extends JsonResource
{
	public function toArray(Request $request): array
	{
		return [
			'id' => $this->id,
			'body' => $this->body,
			'trainer' => $this->whenLoaded('trainer', function () {
				return [
					'id' => $this->trainer?->id,
					'name' => $this->trainer?->name,
				];
			}),
			'created_at' => $this->created_at,
			'updated_at' => $this->updated_at,
		];
	}
}
