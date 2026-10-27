<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
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
			'workoutExercises.exercise.muscleGroup',
			'workoutExercises.series',
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
			'workoutExercises.exercise.muscleGroup',
			'workoutExercises.series',
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

	/**
	 * Troca de exercícios do treino pelo próprio aluno, mantendo a estrutura
	 * montada pelo personal.
	 *
	 * Só a coluna exercise_id de workout_exercises é alterada: as séries
	 * (workout_exercise_series) não são tocadas, então volume, repetições,
	 * carga, RIR, descanso e técnica avançada permanecem como prescritos. É por
	 * isso que esta rota existe em vez de reaproveitar o update do
	 * ManagedWorkoutController, que apaga e recria os exercícios.
	 *
	 * Check-ins já registrados guardam o próprio snapshot (exercise_id e
	 * planned_*), portanto o histórico anterior à troca continua intacto.
	 */
	public function updateExercises(Request $request, $id)
	{
		$profile = $request->user()->studentProfile;

		if (!$profile) {
			return response()->json([
				'message' => 'Perfil de student não encontrado'
			], 404);
		}

		$request->validate([
			'exercises' => 'required|array|min:1',
			'exercises.*.workout_exercise_id' => 'required|integer',
			'exercises.*.exercise_id' => 'required|exists:exercises,id',
		], [
			'exercises.required' => 'Informe os exercícios do treino.',
			'exercises.*.exercise_id.required' => 'Selecione o exercício.',
			'exercises.*.exercise_id.exists' => 'Exercício não encontrado.',
		]);

		$workout = Workout::with('workoutExercises')
			->where('student_profile_id', $profile->id)
			->where('id', $id)
			->first();

		if (!$workout) {
			return response()->json([
				'message' => 'Treino não encontrado'
			], 404);
		}

		if (!$workout->active) {
			return response()->json([
				'message' => 'Este treino está inativo e não pode ser alterado.'
			], 403);
		}

		$items = $request->input('exercises');
		$workoutExercises = $workout->workoutExercises->keyBy('id');

		foreach ($items as $index => $item) {
			if (!$workoutExercises->has($item['workout_exercise_id'])) {
				throw ValidationException::withMessages([
					"exercises.{$index}.workout_exercise_id" => 'Este exercício não pertence ao treino.',
				]);
			}
		}

		// A composição final precisa continuar sem repetição: o snapshot do
		// check-in indexa os exercícios prescritos por exercise_id e perderia
		// uma das entradas duplicadas.
		$this->assertNoDuplicateExercises($workoutExercises, $items);

		DB::transaction(function () use ($workoutExercises, $items) {
			foreach ($items as $item) {
				$workoutExercise = $workoutExercises->get($item['workout_exercise_id']);

				if ((int) $workoutExercise->exercise_id === (int) $item['exercise_id']) {
					continue;
				}

				$workoutExercise->update(['exercise_id' => $item['exercise_id']]);
			}
		});

		$workout->load([
			'workoutExercises.exercise.muscleGroup',
			'workoutExercises.series',
		]);

		return response()->json([
			'message' => 'Exercícios atualizados com sucesso',
			'workout' => $workout,
		]);
	}

	/**
	 * Valida a composição resultante da troca: os exercícios enviados somados
	 * aos que o aluno não alterou não podem conter repetição.
	 */
	private function assertNoDuplicateExercises($workoutExercises, array $items): void
	{
		$finalExerciseIds = $workoutExercises
			->mapWithKeys(fn ($workoutExercise) => [
				$workoutExercise->id => (int) $workoutExercise->exercise_id,
			])
			->toArray();

		foreach ($items as $item) {
			$finalExerciseIds[$item['workout_exercise_id']] = (int) $item['exercise_id'];
		}

		foreach ($items as $index => $item) {
			$exerciseId = (int) $item['exercise_id'];
			$occurrences = count(array_keys($finalExerciseIds, $exerciseId, true));

			if ($occurrences > 1) {
				throw ValidationException::withMessages([
					"exercises.{$index}.exercise_id" => 'Este exercício já está no treino.',
				]);
			}
		}
	}
}
