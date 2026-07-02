<?php

namespace App\Http\Controllers\Api\Trainer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Workout;

class WorkoutController extends Controller
{
	public function index()
	{
		return response()->json(
			Workout::with(['studentProfile.user', 'trainer', 'workoutExercises'])
				->get()
		);
	}

	public function store(Request $request)
	{
		$request->validate([
			'student_profile_id' => 'required|exists:student_profiles,id',
			'trainer_id' => 'nullable|exists:users,id',
			'name' => 'required|string|max:255',
			'description' => 'nullable|string',
			'start_date' => 'nullable|date',
			'end_date' => 'nullable|date|after_or_equal:start_date',
			'active' => 'nullable|boolean',
		]);

		$workout = Workout::create([
			'student_profile_id' => $request->student_profile_id,
			'trainer_id' => $request->trainer_id,
			'name' => $request->name,
			'description' => $request->description,
			'start_date' => $request->start_date,
			'end_date' => $request->end_date,
			'active' => $request->active ?? true,
		]);

		return response()->json([
			'message' => 'Treino criado com sucesso',
			'workout' => $workout
		], 201);
	}

	public function show($id)
	{
		$workout = Workout::with(['studentProfile.user', 'trainer', 'workoutExercises'])
			->find($id);

		if (!$workout) {
			return response()->json([
				'message' => 'Treino não encontrado'
			], 404);
		}

		return response()->json($workout);
	}

	public function update(Request $request, $id)
	{
		$workout = Workout::find($id);

		if (!$workout) {
			return response()->json([
				'message' => 'Treino não encontrado'
			], 404);
		}

		$request->validate([
			'name' => 'sometimes|string|max:255',
			'description' => 'nullable|string',
			'start_date' => 'nullable|date',
			'end_date' => 'nullable|date|after_or_equal:start_date',
			'active' => 'nullable|boolean',
		]);

		$workout->update($request->only([
			'name',
			'description',
			'start_date',
			'end_date',
			'active'
		]));

		return response()->json([
			'message' => 'Treino atualizado com sucesso',
			'workout' => $workout
		]);
	}

	public function destroy($id)
	{
		$workout = Workout::find($id);

		if (!$workout) {
			return response()->json([
				'message' => 'Treino não encontrado'
			], 404);
		}

		$workout->delete();

		return response()->json([
			'message' => 'Treino removido com sucesso'
		]);
	}
}
