<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TrainerResource extends JsonResource
{
	public function toArray(Request $request): array
	{
		$subscription = $this->relationLoaded('currentSubscription')
			? $this->currentSubscription
			: null;
		$plan = $subscription?->plan;

		return [
			'id' => $this->id,
			'name' => $this->name,
			'email' => $this->email,
			'students_count' => (int) $this->students_count,
			'is_active' => (bool) $this->is_active,
			'created_at' => $this->created_at,

			// null = nenhum plano atribuído. `student_limit` é informativo: não
			// há enforcement no código, ele só permite ver o consumo real e
			// validar a escada de planos antes de escrever o gate.
			'plan' => $plan ? [
				'code' => $plan->code,
				'name' => $plan->name,
				'student_limit' => $plan->student_limit,
			] : null,
			'subscription' => $subscription ? [
				'id' => $subscription->id,
				'ends_at' => $subscription->ends_at?->toDateString(),
				'source' => $subscription->source,
			] : null,
		];
	}
}
