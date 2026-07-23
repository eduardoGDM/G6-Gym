<?php

namespace App\Http\Controllers\Api\Trainer;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\StudentProfile;
use App\Models\Subscription;
use Illuminate\Http\Request;

/**
 * Plano do próprio personal — somente leitura.
 *
 * Não há contratação nem troca de plano pela aplicação: hoje quem atribui é o
 * admin, manualmente. Quando o gateway entrar, é aqui que o botão de assinar
 * vai encostar.
 */
class PlanController extends Controller
{
	public function show(Request $request)
	{
		$trainer = $request->user();
		$trainer->load('currentSubscription.plan');

		$subscription = $trainer->currentSubscription;
		$plan = $subscription?->plan;

		// Vaga é contada por CPF distinto e só é liberada 30 dias após a remoção
		// do aluno — ver StudentProfile::SLOT_RELEASE_DAYS.
		$studentsCount = StudentProfile::usedSlotsFor($trainer->id);

		return response()->json([
			'plan' => $plan ? $this->presentPlan($plan) : null,
			'subscription' => $subscription ? [
				'starts_at' => $subscription->starts_at?->toDateString(),
				'ends_at' => $subscription->ends_at?->toDateString(),
				'days_left' => $this->daysLeft($subscription),
			] : null,
			'usage' => [
				'students' => $studentsCount,
				'students_limit' => $plan?->student_limit,
			],
		]);
	}

	/**
	 * Catálogo completo da escada, para o personal comparar os degraus. Marca
	 * qual é o dele — a troca em si continua sendo feita pelo admin.
	 */
	public function index(Request $request)
	{
		$trainer = $request->user();
		$trainer->load('currentSubscription.plan');

		$currentCode = $trainer->currentSubscription?->plan?->code;

		$plans = Plan::orderBy('sort_order')->get()->map(
			fn (Plan $plan) => [
				...$this->presentPlan($plan),
				'is_current' => $plan->code === $currentCode,
			],
		);

		return response()->json($plans);
	}

	private function presentPlan(Plan $plan): array
	{
		return [
			'code' => $plan->code,
			'name' => $plan->name,
			'price_cents' => $plan->price_cents,
			'student_limit' => $plan->student_limit,
			'features' => [
				'physical_assessment' => $plan->allows_physical_assessment,
				'photos' => $plan->allows_photos,
				'videos' => $plan->allows_videos,
				'pdf' => $plan->allows_pdf,
			],
		];
	}

	/**
	 * Dias restantes de uma assinatura com vencimento (trial, por exemplo).
	 * null quando não há vencimento definido.
	 */
	private function daysLeft(Subscription $subscription): ?int
	{
		if (!$subscription->ends_at) {
			return null;
		}

		return max(0, (int) ceil(now()->diffInDays($subscription->ends_at, false)));
	}
}
