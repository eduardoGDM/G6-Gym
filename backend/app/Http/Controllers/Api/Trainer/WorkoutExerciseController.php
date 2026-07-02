<?php

namespace App\Http\Controllers\Api\Trainer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\WorkoutExercise;

class WorkoutExerciseController extends Controller
{
	public function index($workoutId)
	{
		return response()->json(
			WorkoutExercise::with(['exercise', 'trainingMethod'])
				->where('workout_id', $workoutId)
				->orderBy('order')
				->get()
		);
	}

	public function store(Request $request)
	{
		$request->validate([
			'workout_id' => 'required|exists:workouts,id',
			'exercise_id' => 'required|exists:exercises,id',
			'training_method_id' => 'nullable|exists:training_methods,id',
			'order' => 'nullable|integer|min:1',
			'warm_up_sets' => 'nullable|integer|min:0',
			'recognition_sets' => 'nullable|integer|min:0',
			'valid_sets' => 'required|integer|min:1',
			'reps' => 'nullable|string|max:50',
			'rir' => 'nullable|integer|min:0|max:10',
			'rest_seconds' => 'nullable|integer|min:0',
			'cadence' => 'nullable|string|max:20',
			'load' => 'nullable|numeric|min:0',
			'observations' => 'nullable|string',
		]);

		$workoutExercise = WorkoutExercise::create([
			'workout_id' => $request->workout_id,
			'exercise_id' => $request->exercise_id,
			'training_method_id' => $request->training_method_id,
			'order' => $request->order ?? 1,
			'warm_up_sets' => $request->warm_up_sets,
			'recognition_sets' => $request->recognition_sets,
			'valid_sets' => $request->valid_sets,
			'reps' => $request->reps,
			'rir' => $request->rir,
			'rest_seconds' => $request->rest_seconds,
			'cadence' => $request->cadence,
			'load' => $request->load,
			'observations' => $request->observations,
		]);

		return response()->json([
			'message' => 'Exercício adicionado ao treino com sucesso',
			'workout_exercise' => $workoutExercise
		], 201);
	}

	public function show($id)
	{
		$workoutExercise = WorkoutExercise::with(['exercise', 'trainingMethod', 'workout'])
			->find($id);

		if (!$workoutExercise) {
			return response()->json([
				'message' => 'Registro não encontrado'
			], 404);
		}

		return response()->json($workoutExercise);
	}

	public function update(Request $request, $id)
	{
		$workoutExercise = WorkoutExercise::find($id);

		if (!$workoutExercise) {
			return response()->json([
				'message' => 'Registro não encontrado'
			], 404);
		}

		$request->validate([
			'order' => 'sometimes|integer|min:1',
			'warm_up_sets' => 'nullable|integer|min:0',
			'recognition_sets' => 'nullable|integer|min:0',
			'valid_sets' => 'nullable|integer|min:1',
			'reps' => 'nullable|string|max:50',
			'rir' => 'nullable|integer|min:0|max:10',
			'rest_seconds' => 'nullable|integer|min:0',
			'cadence' => 'nullable|string|max:20',
			'load' => 'nullable|numeric|min:0',
			'observations' => 'nullable|string',
		]);

		$workoutExercise->update($request->only([
			'order',
			'warm_up_sets',
			'recognition_sets',
			'valid_sets',
			'reps',
			'rir',
			'rest_seconds',
			'cadence',
			'load',
			'observations',
		]));

		return response()->json([
			'message' => 'Exercício do treino atualizado com sucesso',
			'workout_exercise' => $workoutExercise
		]);
	}

	public function destroy($id)
	{
		$workoutExercise = WorkoutExercise::find($id);

		if (!$workoutExercise) {
			return response()->json([
				'message' => 'Registro não encontrado'
			], 404);
		}

		$workoutExercise->delete();

		return response()->json([
			'message' => 'Exercício removido do treino com sucesso'
		]);
	}
}
