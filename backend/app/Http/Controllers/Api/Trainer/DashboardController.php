<?php

namespace App\Http\Controllers\Api\Trainer;

use App\Http\Controllers\Controller;
use App\Models\DailyCheckin;
use App\Models\StudentProfile;
use App\Models\Workout;
use App\Models\WorkoutCheckin;
use Illuminate\Http\Request;

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

		return response()->json([
			'active_students' => $activeStudents,
			'active_workouts' => $activeWorkouts,
			'workout_checkins_today' => $workoutCheckinsToday,
			'daily_checkins_today' => $dailyCheckinsToday,
		]);
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
