<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Workout;

class WorkoutController extends Controller
{
	public function index(Request $request)
	{
		$user = $request->user();

		$profile = $user->studentProfile;

		if (!$profile) {
			return response()->json([
				'message' => 'Perfil de student não encontrado'
			], 404);
		}

		$workouts = Workout::with([
			'workoutExercises.exercise.muscleGroup'
		])
			->where('student_profile_id', $profile->id)
			->where('active', true)
			->get();

		return response()->json($workouts);
	}

	public function show(Request $request, $id)
	{
		$user = $request->user();

		$profile = $user->studentProfile;

		if (!$profile) {
			return response()->json([
				'message' => 'Perfil de student não encontrado'
			], 404);
		}

		$workout = Workout::with([
			'workoutExercises.exercise.muscleGroup'
		])
			->where('student_profile_id', $profile->id)
			->where('id', $id)
			->first();

		if (!$workout) {
			return response()->json([
				'message' => 'Treino não encontrado'
			], 404);
		}

		return response()->json($workout);
	}
}
