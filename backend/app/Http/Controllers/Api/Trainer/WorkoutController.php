<?php

namespace App\Http\Controllers\Api\Trainer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Workout;
use App\Models\WorkoutExercise;
use App\Models\WorkoutExerciseSeries;

class WorkoutController extends Controller
{
	private const WORKOUT_RELATIONS = [
		'studentProfile.user',
		'trainer',
		'muscleGroups',
		'workoutExercises.exercise.muscleGroup',
		'workoutExercises.series',
	];

	private const EXERCISES_VALIDATION_RULES = [
		'muscle_groups' => 'nullable|array',
		'muscle_groups.*' => 'integer|exists:muscle_groups,id',
		'exercises' => 'nullable|array',
		'exercises.*.exercise_id' => 'required|exists:exercises,id',
		'exercises.*.order' => 'required|integer|min:1',
		'exercises.*.notes' => 'nullable|string',
		'exercises.*.series' => 'nullable|array',
		'exercises.*.series.*.order' => 'required|integer|min:1',
		'exercises.*.series.*.repetitions' => 'nullable|integer|min:0',
		'exercises.*.series.*.weight' => 'nullable|numeric|min:0',
		'exercises.*.series.*.rest_time' => 'nullable|integer|min:0',
		'exercises.*.series.*.rir' => 'nullable|integer|min:0|max:10',
		'exercises.*.series.*.tempo' => 'nullable|string|max:20',
		'exercises.*.series.*.cadence' => 'nullable|string|max:20',
		'exercises.*.series.*.duration' => 'nullable|integer|min:0',
		'exercises.*.series.*.notes' => 'nullable|string',
	];

	public function index()
	{
		return response()->json(
			Workout::with(self::WORKOUT_RELATIONS)->get()
		);
	}

	public function store(Request $request)
	{
		$request->validate(array_merge([
			'student_profile_id' => 'required|exists:student_profiles,id',
			'name' => 'required|string|max:255',
			'description' => 'nullable|string',
			'start_date' => 'required|date',
			'end_date' => 'nullable|date|after_or_equal:start_date',
			'active' => 'nullable|boolean',
		], self::EXERCISES_VALIDATION_RULES));

		$workout = DB::transaction(function () use ($request) {
			$workout = Workout::create([
				'student_profile_id' => $request->student_profile_id,
				'trainer_id' => $request->user()->id,
				'name' => $request->name,
				'description' => $request->description,
				'start_date' => $request->start_date,
				'end_date' => $request->end_date,
				'active' => $request->active ?? true,
			]);

			$workout->muscleGroups()->sync($request->input('muscle_groups', []));

			$this->syncExercises($workout, $request->input('exercises', []));

			return $workout;
		});

		$workout->load(self::WORKOUT_RELATIONS);

		return response()->json([
			'message' => 'Treino criado com sucesso',
			'workout' => $workout
		], 201);
	}

	public function show($id)
	{
		$workout = Workout::with(self::WORKOUT_RELATIONS)->find($id);

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

		$request->validate(array_merge([
			'student_profile_id' => 'sometimes|exists:student_profiles,id',
			'name' => 'sometimes|string|max:255',
			'description' => 'nullable|string',
			'start_date' => 'sometimes|date',
			'end_date' => 'nullable|date|after_or_equal:start_date',
			'active' => 'nullable|boolean',
		], self::EXERCISES_VALIDATION_RULES));

		DB::transaction(function () use ($request, $workout) {
			$workout->update($request->only([
				'student_profile_id',
				'name',
				'description',
				'start_date',
				'end_date',
				'active'
			]));

			if ($request->has('muscle_groups')) {
				$workout->muscleGroups()->sync($request->input('muscle_groups', []));
			}

			if ($request->has('exercises')) {
				$workout->workoutExercises()->delete();

				$this->syncExercises($workout, $request->input('exercises', []));
			}
		});

		$workout->load(self::WORKOUT_RELATIONS);

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

	private function syncExercises(Workout $workout, array $exercises): void
	{
		foreach ($exercises as $item) {
			$workoutExercise = WorkoutExercise::create([
				'workout_id' => $workout->id,
				'exercise_id' => $item['exercise_id'],
				'order' => $item['order'],
				'notes' => $item['notes'] ?? null,
			]);

			foreach ($item['series'] ?? [] as $series) {
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
	}
}
