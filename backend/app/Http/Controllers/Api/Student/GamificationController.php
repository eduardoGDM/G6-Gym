<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\DailyCheckin;
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
	 * Resumo de gamificação do aluno: sequência de treinos (streak), indicador de
	 * cor do sono mais recente e visão consolidada dos últimos 7 dias.
	 */
	public function summary(Request $request)
	{
		$profile = $this->resolveProfile($request);

		if (!$profile) {
			return response()->json([
				'message' => 'Perfil de student não encontrado'
			], 404);
		}

		$latestSleep = DailyCheckin::where('student_profile_id', $profile->id)
			->orderByDesc('date')
			->orderByDesc('created_at')
			->first();

		return response()->json([
			'streak' => $profile->workoutStreak(),
			'sleep' => $latestSleep ? [
				'rating' => $latestSleep->sleep_rating,
				'level' => DailyCheckin::ratingLevel($latestSleep->sleep_rating),
				'date' => $latestSleep->date->format('Y-m-d'),
			] : null,
			'week' => $this->weeklyOverview($profile),
		]);
	}

	/**
	 * Monta os últimos 7 dias (mais antigo → hoje) indicando, por dia, se houve
	 * treino e o nível de cor do sono registrado naquela data.
	 *
	 * @return array<int, array{date: string, trained: bool, sleep_level: ?string}>
	 */
	private function weeklyOverview(StudentProfile $profile): array
	{
		$start = Carbon::today()->subDays(self::WEEK_DAYS - 1);

		$trainedDates = WorkoutCheckin::where('student_profile_id', $profile->id)
			->whereDate('performed_at', '>=', $start->toDateString())
			->pluck('performed_at')
			->map(fn ($date) => Carbon::parse($date)->toDateString())
			->flip();

		$sleepByDate = DailyCheckin::where('student_profile_id', $profile->id)
			->whereDate('date', '>=', $start->toDateString())
			->get()
			->keyBy(fn ($checkin) => Carbon::parse($checkin->date)->toDateString());

		$week = [];

		for ($i = self::WEEK_DAYS - 1; $i >= 0; $i--) {
			$date = Carbon::today()->subDays($i)->toDateString();
			$checkin = $sleepByDate->get($date);

			$week[] = [
				'date' => $date,
				'trained' => $trainedDates->has($date),
				'sleep_level' => $checkin ? DailyCheckin::ratingLevel($checkin->sleep_rating) : null,
			];
		}

		return $week;
	}
}
