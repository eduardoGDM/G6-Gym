<?php

namespace App\Http\Controllers\Api\Trainer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use App\Models\WorkoutExercise;
use App\Models\WorkoutExerciseSeries;

class WorkoutExerciseController extends Controller
{
	private const SERIES_VALIDATION_RULES = [
		'series' => 'nullable|array',
		'series.*.order' => 'required|integer|min:1',
		'series.*.repetitions' => 'nullable|integer|min:0',
		'series.*.weight' => 'nullable|numeric|min:0',
		'series.*.rest_time' => 'nullable|integer|min:0',
		'series.*.rir' => 'nullable|integer|min:0|max:10',
		'series.*.tempo' => 'nullable|string|max:20',
		'series.*.cadence' => 'nullable|string|max:20',
		'series.*.duration' => 'nullable|integer|min:0',
		'series.*.notes' => 'nullable|string',
	];

	public function index(Request $request, $workoutId)
	{
		return response()->json(
			WorkoutExercise::with('exercise', 'series')
				->where('workout_id', $workoutId)
				->whereHas('workout', function ($query) use ($request) {
					$query->where('trainer_id', $request->user()->id);
				})
				->orderBy('order')
				->get()
		);
	}

	public function store(Request $request)
	{
		$request->validate(array_merge([
			'workout_id' => [
				'required',
				Rule::exists('workouts', 'id')->where('trainer_id', $request->user()->id),
			],
			'exercise_id' => 'required|exists:exercises,id',
			'order' => 'nullable|integer|min:1',
			'notes' => 'nullable|string',
		], self::SERIES_VALIDATION_RULES));

		$workoutExercise = DB::transaction(function () use ($request) {
			$workoutExercise = WorkoutExercise::create([
				'workout_id' => $request->workout_id,
				'exercise_id' => $request->exercise_id,
				'order' => $request->order ?? 1,
				'notes' => $request->notes,
			]);

			foreach ($request->input('series', []) as $series) {
				WorkoutExerciseSeries::create([
					'workout_exercise_id' => $workoutExercise->id,
					'order' => $series['order'],
					'repetitions' => $series['repetitions'] ?? null,
					'weight' => $series['weight'] ?? null,
					'rest_time' => $series['rest_time'] ?? null,
					'rir' => $series['rir'] ?? null,
					'tempo' => $series['tempo'] ?? null,
					'cadence' => $series['cadence'] ?? null,
					'duration' => $series['duration'] ?? null,
					'notes' => $series['notes'] ?? null,
				]);
			}

			return $workoutExercise;
		});

		$workoutExercise->load('exercise', 'series');

		return response()->json([
			'message' => 'Exercício adicionado ao treino com sucesso',
			'workout_exercise' => $workoutExercise
		], 201);
	}

	public function show(Request $request, $id)
	{
		$workoutExercise = WorkoutExercise::with(['exercise', 'workout', 'series'])
			->whereHas('workout', function ($query) use ($request) {
				$query->where('trainer_id', $request->user()->id);
			})
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
		$workoutExercise = WorkoutExercise::whereHas('workout', function ($query) use ($request) {
			$query->where('trainer_id', $request->user()->id);
		})->find($id);

		if (!$workoutExercise) {
			return response()->json([
				'message' => 'Registro não encontrado'
			], 404);
		}

		$request->validate(array_merge([
			'order' => 'sometimes|integer|min:1',
			'notes' => 'nullable|string',
		], self::SERIES_VALIDATION_RULES));

		DB::transaction(function () use ($request, $workoutExercise) {
			$workoutExercise->update($request->only([
				'order',
				'notes',
			]));

			if ($request->has('series')) {
				$workoutExercise->series()->delete();

				foreach ($request->input('series', []) as $series) {
					WorkoutExerciseSeries::create([
						'workout_exercise_id' => $workoutExercise->id,
						'order' => $series['order'],
						'repetitions' => $series['repetitions'] ?? null,
						'weight' => $series['weight'] ?? null,
						'rest_time' => $series['rest_time'] ?? null,
						'rir' => $series['rir'] ?? null,
						'tempo' => $series['tempo'] ?? null,
						'cadence' => $series['cadence'] ?? null,
						'duration' => $series['duration'] ?? null,
						'notes' => $series['notes'] ?? null,
					]);
				}
			}
		});

		$workoutExercise->load('exercise', 'series');

		return response()->json([
			'message' => 'Exercício do treino atualizado com sucesso',
			'workout_exercise' => $workoutExercise
		]);
	}

	public function destroy(Request $request, $id)
	{
		$workoutExercise = WorkoutExercise::whereHas('workout', function ($query) use ($request) {
			$query->where('trainer_id', $request->user()->id);
		})->find($id);

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
