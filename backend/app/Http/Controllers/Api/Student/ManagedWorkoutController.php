<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Concerns\ManagesWorkouts;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Resources\WorkoutResource;
use App\Models\Workout;

/**
 * Autogestão de treinos pelo aluno autorizado pelo personal
 * (student_profiles.can_manage_workouts, validado no middleware
 * `can-manage-workouts`).
 *
 * Escopo: o aluno gerencia todos os treinos do próprio perfil, inclusive os
 * montados pelo personal — a permissão é autogestão completa, não apenas dos
 * treinos que ele mesmo criou. O vínculo nunca vem do request: o
 * student_profile_id e o trainer_id saem sempre do perfil autenticado, então o
 * aluno não consegue mover um treino para outro aluno nem trocar de personal.
 */
class ManagedWorkoutController extends Controller
{
	use ManagesWorkouts;

	private const WORKOUT_FIELDS_VALIDATION_RULES = [
		'description' => 'nullable|string',
		'end_date' => 'nullable|date|after_or_equal:start_date',
		'active' => 'nullable|boolean',
	];

	public function index(Request $request)
	{
		$request->validate([
			'status' => 'nullable|in:all,active,inactive',
			'per_page' => 'nullable|integer|min:1|max:100',
		]);

		$status = $request->input('status', 'all');
		$perPage = (int) $request->input('per_page', 10);

		$workouts = Workout::with(['studentProfile.user', 'muscleGroups'])
			->where('student_profile_id', $request->user()->studentProfile->id)
			->withCount('workoutExercises')
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
			'name' => 'required|string|max:255',
			'start_date' => 'required|date',
		], self::WORKOUT_FIELDS_VALIDATION_RULES, self::EXERCISES_VALIDATION_RULES), self::SERIES_VALIDATION_MESSAGES);

		$user = $request->user();
		$profile = $user->studentProfile;

		$workout = DB::transaction(function () use ($request, $user, $profile) {
			$workout = Workout::create([
				'student_profile_id' => $profile->id,
				'trainer_id' => $profile->trainer_id,
				'created_by' => $user->id,
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
			->where('student_profile_id', $request->user()->studentProfile->id)
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
		$workout = $this->findWorkout($request, $id);

		if (!$workout instanceof Workout) {
			return $workout;
		}

		$request->validate(array_merge([
			'name' => 'sometimes|string|max:255',
			'start_date' => 'sometimes|date',
		], self::WORKOUT_FIELDS_VALIDATION_RULES, self::EXERCISES_VALIDATION_RULES), self::SERIES_VALIDATION_MESSAGES);

		DB::transaction(function () use ($request, $workout) {
			$workout->update($request->only([
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
		$workout = $this->findWorkout($request, $id);

		if (!$workout instanceof Workout) {
			return $workout;
		}

		$workout->delete();

		return response()->json([
			'message' => 'Treino removido com sucesso'
		]);
	}

	public function sheet(Request $request)
	{
		$profile = $request->user()->studentProfile->load(['user', 'trainer']);

		return $this->workoutSheetDownload($profile, $profile->trainer);
	}

	/**
	 * Treino do próprio aluno. O perfil autenticado é o único filtro: treino de
	 * outro aluno é tratado como inexistente (404), e quem montou o treino não
	 * importa — o aluno com autogestão altera também o que veio do personal.
	 */
	private function findWorkout(Request $request, $id)
	{
		$workout = Workout::where('student_profile_id', $request->user()->studentProfile->id)
			->find($id);

		if (!$workout) {
			return response()->json([
				'message' => 'Treino não encontrado'
			], 404);
		}

		return $workout;
	}
}
