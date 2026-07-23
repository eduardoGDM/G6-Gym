<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Atribuição manual de plano a um personal.
 *
 * Enquanto não existe gateway, é o admin quem coloca o personal num plano. A
 * troca **não sobrescreve** a assinatura anterior: encerra a vigente e cria uma
 * nova, preservando o histórico de quem subiu/desceu de degrau — que é
 * justamente o dado necessário para validar a escada de planos.
 */
class SubscriptionController extends Controller
{
	public function index(Request $request, $trainer)
	{
		$trainerUser = User::where('role', 'trainer')->find($trainer);

		if (!$trainerUser) {
			return response()->json(['message' => 'Personal não encontrado'], 404);
		}

		$subscriptions = $trainerUser->subscriptions()
			->with(['plan', 'assignedBy'])
			->orderByDesc('id')
			->get()
			->map(fn (Subscription $subscription) => [
				'id' => $subscription->id,
				'plan' => [
					'code' => $subscription->plan?->code,
					'name' => $subscription->plan?->name,
				],
				'status' => $subscription->status,
				'starts_at' => $subscription->starts_at?->toDateString(),
				'ends_at' => $subscription->ends_at?->toDateString(),
				'source' => $subscription->source,
				'assigned_by' => $subscription->assignedBy?->name,
				'notes' => $subscription->notes,
			]);

		return response()->json($subscriptions);
	}

	public function update(Request $request, $trainer)
	{
		$trainerUser = User::where('role', 'trainer')->find($trainer);

		if (!$trainerUser) {
			return response()->json(['message' => 'Personal não encontrado'], 404);
		}

		$data = $request->validate([
			'plan_code' => 'required|string|exists:plans,code',
			'ends_at' => 'nullable|date|after:today',
			'notes' => 'nullable|string',
		]);

		$plan = Plan::where('code', $data['plan_code'])->firstOrFail();

		$subscription = DB::transaction(function () use ($trainerUser, $plan, $data, $request) {
			$trainerUser->subscriptions()
				->where('status', Subscription::STATUS_ACTIVE)
				->update(['status' => Subscription::STATUS_CANCELED]);

			return $trainerUser->subscriptions()->create([
				'plan_id' => $plan->id,
				'status' => Subscription::STATUS_ACTIVE,
				'starts_at' => now(),
				'ends_at' => $data['ends_at'] ?? null,
				'source' => Subscription::SOURCE_MANUAL,
				'assigned_by' => $request->user()->id,
				'notes' => $data['notes'] ?? null,
			]);
		});

		return response()->json([
			'message' => "Plano {$plan->name} atribuído com sucesso",
			'subscription' => [
				'id' => $subscription->id,
				'plan' => ['code' => $plan->code, 'name' => $plan->name],
				'status' => $subscription->status,
				'ends_at' => $subscription->ends_at?->toDateString(),
			],
		]);
	}

	public function destroy(Request $request, $trainer)
	{
		$trainerUser = User::where('role', 'trainer')->find($trainer);

		if (!$trainerUser) {
			return response()->json(['message' => 'Personal não encontrado'], 404);
		}

		$canceled = $trainerUser->subscriptions()
			->where('status', Subscription::STATUS_ACTIVE)
			->update(['status' => Subscription::STATUS_CANCELED]);

		if (!$canceled) {
			return response()->json([
				'message' => 'Este personal não possui plano ativo'
			], 404);
		}

		return response()->json(['message' => 'Plano removido com sucesso']);
	}
}
