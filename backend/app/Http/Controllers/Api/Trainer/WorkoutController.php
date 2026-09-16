<?php

namespace App\Http\Controllers\Api\Trainer;

use App\Http\Controllers\Concerns\ManagesWorkouts;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use App\Http\Resources\WorkoutResource;
use App\Models\Workout;

class WorkoutController extends Controller
{
	use ManagesWorkouts;

	public function index(Request $request)
	{
		$request->validate([
			'student_search' => 'nullable|string|max:255',
			'status' => 'nullable|in:all,active,inactive',
			'per_page' => 'nullable|integer|min:1|max:100',
		]);

		$studentSearch = $request->input('student_search');
		$status = $request->input('status', 'all');
		$perPage = (int) $request->input('per_page', 10);

		$workouts = Workout::with(['studentProfile.user', 'muscleGroups'])
			->where('trainer_id', $request->user()->id)
			->withCount('workoutExercises')
			->when($studentSearch, function ($query) use ($studentSearch) {
				$query->whereHas('studentProfile.user', function ($query) use ($studentSearch) {
					$query->where('name', 'like', "%{$studentSearch}%");
				});
			})
			->when($status === 'active', function ($query) {
				$query->where('active', true);
			})
			->when($status === 'inactive', function ($query) {
				$query->where('active', false);
			})
			->orderBy('created_at', 'desc')
			->paginate($perPage);

		return WorkoutResource::collection($workouts);
	}

	public function store(Request $request)
	{
		$request->validate(array_merge([
			'student_profile_id' => [
				'required',
				Rule::exists('student_profiles', 'id')->where('trainer_id', $request->user()->id),
			],
			'name' => 'required|string|max:255',
			'description' => 'nullable|string',
			'start_date' => 'required|date',
			'end_date' => 'nullable|date|after_or_equal:start_date',
			'active' => 'nullable|boolean',
		], self::EXERCISES_VALIDATION_RULES), self::SERIES_VALIDATION_MESSAGES);

		$workout = DB::transaction(function () use ($request) {
			$workout = Workout::create([
				'student_profile_id' => $request->student_profile_id,
				'trainer_id' => $request->user()->id,
				'created_by' => $request->user()->id,
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

	public function show(Request $request, $id)
	{
		$workout = Workout::with(self::WORKOUT_RELATIONS)
			->where('trainer_id', $request->user()->id)
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
		$workout = Workout::where('trainer_id', $request->user()->id)->find($id);

		if (!$workout) {
			return response()->json([
				'message' => 'Treino não encontrado'
			], 404);
		}

		$request->validate(array_merge([
			'student_profile_id' => [
				'sometimes',
				Rule::exists('student_profiles', 'id')->where('trainer_id', $request->user()->id),
			],
			'name' => 'sometimes|string|max:255',
			'description' => 'nullable|string',
			'start_date' => 'sometimes|date',
			'end_date' => 'nullable|date|after_or_equal:start_date',
			'active' => 'nullable|boolean',
		], self::EXERCISES_VALIDATION_RULES), self::SERIES_VALIDATION_MESSAGES);

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

	public function destroy(Request $request, $id)
	{
		$workout = Workout::where('trainer_id', $request->user()->id)->find($id);

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
