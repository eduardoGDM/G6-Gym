<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\Exercise;
use App\Models\Workout;
use App\Models\WorkoutCheckin;
use App\Models\WorkoutCheckinExercise;
use App\Models\WorkoutCheckinExerciseSet;
use App\Models\DailyCheckin;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
	private const RECENT_LIMIT = 5;
	private const EVOLUTION_DAYS = 30;

	private function resolveProfile(Request $request)
	{
		return $request->user()->studentProfile;
	}

	public function summary(Request $request)
	{
		$profile = $this->resolveProfile($request);

		if (!$profile) {
			return response()->json([
				'message' => 'Perfil de student não encontrado'
			], 404);
		}

		$activeWorkouts = Workout::where('student_profile_id', $profile->id)
			->where('active', true)
			->count();

		$lastWorkoutCheckin = WorkoutCheckin::where('student_profile_id', $profile->id)
			->max('performed_at');

		$since = now()->subDays(self::EVOLUTION_DAYS)->toDateString();

		$dailyAverages = DailyCheckin::where('student_profile_id', $profile->id)
			->where('date', '>=', $since)
			->selectRaw('avg(sleep_rating) as avg_sleep, avg(diet_rating) as avg_diet')
			->first();

		return response()->json([
			'active_workouts' => $activeWorkouts,
			'last_workout_checkin' => $lastWorkoutCheckin,
			'avg_sleep_rating' => $dailyAverages?->avg_sleep !== null ? round($dailyAverages->avg_sleep, 1) : null,
			'avg_diet_rating' => $dailyAverages?->avg_diet !== null ? round($dailyAverages->avg_diet, 1) : null,
		]);
	}

	public function recentWorkouts(Request $request)
	{
		$profile = $this->resolveProfile($request);

		if (!$profile) {
			return response()->json([
				'message' => 'Perfil de student não encontrado'
			], 404);
		}

		$checkins = WorkoutCheckin::where('student_profile_id', $profile->id)
			->with('workout:id,name')
			->withCount('exercises')
			->orderByDesc('performed_at')
			->orderByDesc('created_at')
			->limit(self::RECENT_LIMIT)
			->get();

		return response()->json(
			$checkins->map(fn ($checkin) => [
				'id' => $checkin->id,
				'workout_name' => $checkin->workout?->name,
				'date' => $checkin->performed_at?->format('Y-m-d'),
				'exercises_count' => $checkin->exercises_count,
			]),
		);
	}

	public function evolution(Request $request)
	{
		$profile = $this->resolveProfile($request);

		if (!$profile) {
			return response()->json([
				'message' => 'Perfil de student não encontrado'
			], 404);
		}

		$totalCheckins = WorkoutCheckin::where('student_profile_id', $profile->id)->count();

		$totalExercises = WorkoutCheckinExercise::whereHas('workoutCheckin', function ($query) use ($profile) {
			$query->where('student_profile_id', $profile->id);
		})->count();

		$topExercise = WorkoutCheckinExercise::query()
			->join('workout_checkins', 'workout_checkins.id', '=', 'workout_checkin_exercises.workout_checkin_id')
			->where('workout_checkins.student_profile_id', $profile->id)
			->selectRaw('workout_checkin_exercises.exercise_id, count(*) as total')
			->groupBy('workout_checkin_exercises.exercise_id')
			->orderByDesc('total')
			->first();

		$topExerciseName = $topExercise
			? Exercise::find($topExercise->exercise_id)?->name
			: null;

		$maxWeight = WorkoutCheckinExerciseSet::query()
			->join('workout_checkin_exercises', 'workout_checkin_exercises.id', '=', 'workout_checkin_exercise_sets.workout_checkin_exercise_id')
			->join('workout_checkins', 'workout_checkins.id', '=', 'workout_checkin_exercises.workout_checkin_id')
			->where('workout_checkins.student_profile_id', $profile->id)
			->max('workout_checkin_exercise_sets.performed_weight');

		return response()->json([
			'top_exercise' => $topExerciseName,
			'max_weight' => $maxWeight !== null ? (float) $maxWeight : null,
			'total_checkins' => $totalCheckins,
			'total_exercises_performed' => $totalExercises,
		]);
	}
}
