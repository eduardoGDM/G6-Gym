<?php

namespace App\Http\Controllers\Api\Student;

use App\Achievements\AchievementEvaluator;
use App\Achievements\PersonalRecordEvaluator;
use App\Http\Controllers\Controller;
use App\Models\WorkoutCheckin;
use Illuminate\Http\Request;

/**
 * Conquistas obtidas em um check-in de treino.
 *
 * Endpoint desacoplado do fluxo de conclusão do treino: é consultado pelo
 * frontend depois que o check-in já foi salvo, para exibir a tela de celebração.
 * A lógica de cada conquista vive em um AchievementEvaluator; para adicionar
 * novas conquistas (sequência de treinos, recorde semanal, etc.) basta incluir
 * o avaliador na lista abaixo.
 */
class AchievementController extends Controller
{
	/**
	 * Avaliadores executados, na ordem em que suas conquistas aparecem.
	 *
	 * @var array<int, class-string<AchievementEvaluator>>
	 */
	private const EVALUATORS = [
		PersonalRecordEvaluator::class,
	];

	public function forCheckin(Request $request, $id)
	{
		$profile = $request->user()->studentProfile;

		if (!$profile) {
			return response()->json([
				'message' => 'Perfil de student não encontrado'
			], 404);
		}

		$checkin = WorkoutCheckin::where('student_profile_id', $profile->id)
			->where('id', $id)
			->first();

		if (!$checkin) {
			return response()->json([
				'message' => 'Check-in não encontrado'
			], 404);
		}

		$achievements = [];

		foreach (self::EVALUATORS as $evaluator) {
			$achievements = array_merge($achievements, app($evaluator)->evaluate($checkin));
		}

		return response()->json([
			'data' => $achievements,
		]);
	}
}
