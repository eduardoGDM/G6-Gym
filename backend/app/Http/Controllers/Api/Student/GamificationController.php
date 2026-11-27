<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\StudentProfile;
use App\Models\WorkoutCheckin;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class GamificationController extends Controller
{
	private const WEEK_DAYS = 7;

	private function resolveProfile(Request $request)
	{
		return $request->user()->studentProfile;
	}

	/**
	 * Resumo de gamificação do aluno: sequência de treinos (streak) e visão
	 * consolidada dos últimos 7 dias.
	 */
	public function summary(Request $request)
	{
		$profile = $this->resolveProfile($request);

		if (!$profile) {
			return response()->json([
				'message' => 'Perfil de student não encontrado'
			], 404);
		}

		return response()->json([
			'streak' => $profile->workoutStreak(),
			'week' => $this->weeklyOverview($profile),
		]);
	}

	/**
	 * Monta os últimos 7 dias (mais antigo → hoje) indicando, por dia, se houve
	 * treino.
	 *
	 * @return array<int, array{date: string, trained: bool}>
	 */
	private function weeklyOverview(StudentProfile $profile): array
	{
		$start = Carbon::today()->subDays(self::WEEK_DAYS - 1);

		$trainedDates = WorkoutCheckin::where('student_profile_id', $profile->id)
			->whereDate('performed_at', '>=', $start->toDateString())
			->pluck('performed_at')
			->map(fn ($date) => Carbon::parse($date)->toDateString())
			->flip();

		$week = [];

		for ($i = self::WEEK_DAYS - 1; $i >= 0; $i--) {
			$date = Carbon::today()->subDays($i)->toDateString();

			$week[] = [
				'date' => $date,
				'trained' => $trainedDates->has($date),
			];
		}

		return $week;
	}
}
