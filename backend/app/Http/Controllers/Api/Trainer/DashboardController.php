<?php

namespace App\Http\Controllers\Api\Trainer;

use App\Http\Controllers\Controller;
use App\Models\DailyCheckin;
use App\Models\StudentProfile;
use App\Models\Workout;
use App\Models\WorkoutCheckin;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
	private const RECENT_LIMIT = 5;

	/**
	 * O aluno pertence ao trainer através do FK student_profiles.trainer_id.
	 */
	private function scopeStudentsToTrainer($query, int $trainerId)
	{
		return $query->where('trainer_id', $trainerId);
	}

	public function summary(Request $request)
	{
		$trainerId = $request->user()->id;
		$today = now()->toDateString();

		$activeStudents = $this->scopeStudentsToTrainer(
			StudentProfile::query(),
			$trainerId,
		)->count();

		$activeWorkouts = Workout::where('trainer_id', $trainerId)
			->where('active', true)
			->count();

		$workoutCheckinsToday = WorkoutCheckin::whereHas('studentProfile', function ($query) use ($trainerId) {
			$query->where('trainer_id', $trainerId);
		})
			->whereDate('performed_at', $today)
			->count();

		$dailyCheckinsToday = DailyCheckin::whereHas('studentProfile', function ($query) use ($trainerId) {
			$query->where('trainer_id', $trainerId);
		})
			->whereDate('date', $today)
			->count();

		// --- Variações (deltas) e adesão da semana ---------------------------
		$yesterday = now()->subDay()->toDateString();
		$weekStart = now()->startOfWeek();
		$weekStartDate = $weekStart->toDateString();
		$weekEndDate = $weekStart->copy()->endOfWeek()->toDateString();
		$monthStart = now()->startOfMonth();

		$workoutCheckinsYesterday = WorkoutCheckin::whereHas('studentProfile', function ($query) use ($trainerId) {
			$query->where('trainer_id', $trainerId);
		})
			->whereDate('performed_at', $yesterday)
			->count();
		$checkinsDiff = $workoutCheckinsToday - $workoutCheckinsYesterday;

		$newWorkoutsThisWeek = Workout::where('trainer_id', $trainerId)
			->where('active', true)
			->where('created_at', '>=', $weekStart)
			->count();

		$newStudentsThisMonth = $this->scopeStudentsToTrainer(StudentProfile::query(), $trainerId)
			->where('created_at', '>=', $monthStart)
			->count();

		$studentsCheckedInWeek = $this->scopeStudentsToTrainer(StudentProfile::query(), $trainerId)
			->whereHas('workoutCheckins', function ($query) use ($weekStartDate, $weekEndDate) {
				$query->whereBetween('performed_at', [$weekStartDate, $weekEndDate]);
			})
			->count();
		$weeklyPercentage = $activeStudents > 0
			? (int) round($studentsCheckedInWeek / $activeStudents * 100)
			: 0;

		return response()->json([
			'active_students' => $activeStudents,
			'active_workouts' => $activeWorkouts,
			'workout_checkins_today' => $workoutCheckinsToday,
			'daily_checkins_today' => $dailyCheckinsToday,
			'workout_checkins_today_delta' => [
				'value' => abs($checkinsDiff),
				'direction' => $checkinsDiff > 0 ? 'up' : ($checkinsDiff < 0 ? 'down' : 'flat'),
				'period' => 'vs ontem',
			],
			'active_workouts_delta' => $this->additionDelta($newWorkoutsThisWeek, 'esta semana'),
			'active_students_delta' => $this->additionDelta($newStudentsThisMonth, 'este mês'),
			'weekly_adherence' => [
				'students_checked_in' => $studentsCheckedInWeek,
				'active_students' => $activeStudents,
				'percentage' => $weeklyPercentage,
			],
		]);
	}

	/**
	 * Delta de "adições" (novos treinos/alunos no período): direção sobe quando
	 * há novos, senão fica neutro. Sem valores negativos aqui.
	 */
	private function additionDelta(int $value, string $period): array
	{
		return [
			'value' => $value,
			'direction' => $value > 0 ? 'up' : 'flat',
			'period' => $period,
		];
	}

	public function recentWorkoutCheckins(Request $request)
	{
		$trainerId = $request->user()->id;

		$checkins = WorkoutCheckin::whereHas('studentProfile', function ($query) use ($trainerId) {
			$query->where('trainer_id', $trainerId);
		})
			->with(['studentProfile.user:id,name', 'workout:id,name'])
			->orderByDesc('performed_at')
			->orderByDesc('created_at')
			->limit(self::RECENT_LIMIT)
			->get();

		return response()->json(
			$checkins->map(fn ($checkin) => [
				'id' => $checkin->id,
				'student_name' => $checkin->studentProfile?->user?->name,
				'workout_name' => $checkin->workout?->name,
				'date' => $checkin->performed_at?->format('Y-m-d'),
				'time' => $checkin->created_at?->format('H:i'),
			]),
		);
	}

	public function recentDailyCheckins(Request $request)
	{
		$trainerId = $request->user()->id;

		$checkins = DailyCheckin::whereHas('studentProfile', function ($query) use ($trainerId) {
			$query->where('trainer_id', $trainerId);
		})
			->with('studentProfile.user:id,name')
			->orderByDesc('date')
			->orderByDesc('created_at')
			->limit(self::RECENT_LIMIT)
			->get();

		return response()->json(
			$checkins->map(fn ($checkin) => [
				'id' => $checkin->id,
				'student_name' => $checkin->studentProfile?->user?->name,
				'sleep_rating' => $checkin->sleep_rating,
				'diet_rating' => $checkin->diet_rating,
				'date' => $checkin->date?->format('Y-m-d'),
			]),
		);
	}

	/**
	 * Séries semanais (semana corrente, seg→dom) para os dois gráficos do
	 * dashboard: check-ins de treino por dia e check-ins de dieta/sono por dia
	 * (com médias das notas). Apenas leitura/agregação — nada muda de regra.
	 */
	public function weeklyEvolution(Request $request)
	{
		$trainerId = $request->user()->id;

		$start = now()->startOfWeek();
		$end = $start->copy()->addDays(6);
		$startDate = $start->toDateString();
		$endDate = $end->toDateString();

		$labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
		$days = collect(range(0, 6))->map(fn ($offset) => $start->copy()->addDays($offset)->toDateString());

		$workoutCounts = WorkoutCheckin::whereHas('studentProfile', function ($query) use ($trainerId) {
			$query->where('trainer_id', $trainerId);
		})
			->whereBetween('performed_at', [$startDate, $endDate])
			->selectRaw('DATE(performed_at) as d, COUNT(*) as c')
			->groupBy('d')
			->pluck('c', 'd');

		$dailyAgg = DailyCheckin::whereHas('studentProfile', function ($query) use ($trainerId) {
			$query->where('trainer_id', $trainerId);
		})
			->whereBetween('date', [$startDate, $endDate])
			->selectRaw('DATE(`date`) as d, COUNT(*) as c, AVG(sleep_rating) as sleep_avg, AVG(diet_rating) as diet_avg')
			->groupBy('d')
			->get()
			->keyBy('d');

		$workoutSeries = $days->map(fn ($date, $index) => [
			'day' => $labels[$index],
			'date' => $date,
			'count' => (int) ($workoutCounts[$date] ?? 0),
		])->values();

		$dailySeries = $days->map(function ($date, $index) use ($dailyAgg, $labels) {
			$row = $dailyAgg->get($date);

			return [
				'day' => $labels[$index],
				'date' => $date,
				'count' => (int) ($row->c ?? 0),
				'sleep_avg' => $row && $row->sleep_avg !== null ? round((float) $row->sleep_avg, 1) : null,
				'diet_avg' => $row && $row->diet_avg !== null ? round((float) $row->diet_avg, 1) : null,
			];
		})->values();

		return response()->json([
			'workout_checkins' => $workoutSeries,
			'daily_checkins' => $dailySeries,
		]);
	}

	/**
	 * Alunos do personal para o card "Seus alunos" — nome, foto, nº de treinos
	 * ativos, último check-in e um % de progresso (adesão).
	 *
	 * `progress_percentage` = dias distintos com check-in de treino nos últimos
	 * 7 dias ÷ 7 (0–100). É um proxy honesto de consistência semanal; a fórmula
	 * pode evoluir para "sessões realizadas ÷ planejadas" quando houver plano.
	 */
	public function activeStudents(Request $request)
	{
		$trainerId = $request->user()->id;
		$rangeStart = now()->subDays(6)->toDateString();
		$rangeEnd = now()->toDateString();

		$students = $this->scopeStudentsToTrainer(
			StudentProfile::with('user:id,name')
				->withCount(['workouts as active_workouts_count' => function ($query) {
					$query->where('active', true);
				}])
				->withMax('workoutCheckins as last_checkin_date', 'performed_at'),
			$trainerId,
		)
			->orderByDesc('last_checkin_date')
			->limit(self::RECENT_LIMIT + 1)
			->get();

		$ids = $students->pluck('id');
		$daysByStudent = collect();
		if ($ids->isNotEmpty()) {
			$daysByStudent = WorkoutCheckin::whereIn('student_profile_id', $ids)
				->whereBetween('performed_at', [$rangeStart, $rangeEnd])
				->selectRaw('student_profile_id, COUNT(DISTINCT DATE(performed_at)) as days')
				->groupBy('student_profile_id')
				->pluck('days', 'student_profile_id');
		}

		return response()->json(
			$students->map(function ($student) use ($daysByStudent) {
				$distinctDays = (int) ($daysByStudent[$student->id] ?? 0);

				return [
					'id' => $student->id,
					'name' => $student->user?->name,
					'avatar_url' => $student->photo ?: null,
					'active_workouts_count' => (int) $student->active_workouts_count,
					'last_checkin_label' => $this->checkinLabel($student->last_checkin_date),
					'progress_percentage' => (int) round(min(7, $distinctDays) / 7 * 100),
				];
			}),
		);
	}

	/**
	 * Rótulo curto do último check-in de treino ("Check-in hoje/ontem/há N dias").
	 */
	private function checkinLabel($date): string
	{
		if (! $date) {
			return 'Sem check-in';
		}

		$day = Carbon::parse($date)->startOfDay();

		if ($day->isToday()) {
			return 'Check-in hoje';
		}
		if ($day->isYesterday()) {
			return 'Check-in ontem';
		}

		return 'Check-in há ' . (int) $day->diffInDays(Carbon::today()) . ' dias';
	}

	public function pendingDailyCheckins(Request $request)
	{
		$trainerId = $request->user()->id;
		$yesterday = now()->subDay()->toDateString();

		$students = $this->scopeStudentsToTrainer(
			StudentProfile::with('user:id,name')->withMax('dailyCheckins', 'date'),
			$trainerId,
		)
			->whereDoesntHave('dailyCheckins', function ($query) use ($yesterday) {
				$query->whereDate('date', $yesterday);
			})
			->limit(self::RECENT_LIMIT)
			->get();

		return response()->json(
			$students->map(fn ($student) => [
				'id' => $student->id,
				'name' => $student->user?->name,
				'phone' => $student->phone,
				'last_daily_checkin' => $student->daily_checkins_max_date,
			]),
		);
	}
}
