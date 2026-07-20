<?php

namespace App\Http\Controllers\Api\Trainer;

use App\Http\Controllers\Controller;
use App\Models\Exercise;
use App\Models\StudentProfile;
use App\Models\WorkoutCheckin;
use App\Models\WorkoutCheckinExercise;
use Illuminate\Http\Request;

class StudentExerciseEvolutionController extends Controller
{
	/**
	 * Lista apenas os grupos musculares que possuem histórico executado (com
	 * carga registrada) para o aluno, nunca o cadastro geral de MuscleGroup.
	 */
	public function muscleGroups(Request $request, $student)
	{
		$trainerId = $request->user()->id;
		$studentProfile = StudentProfile::find($student);

		if (!$studentProfile) {
			return response()->json([
				'message' => 'Aluno não encontrado',
			], 404);
		}

		$muscleGroups = $this->executedCheckinExercisesQuery($studentProfile->id, $trainerId)
			->get()
			->pluck('exercise.muscleGroup')
			->filter()
			->unique('id')
			->sortBy('name')
			->values()
			->map(fn ($group) => ['id' => $group->id, 'name' => $group->name]);

		return response()->json($muscleGroups);
	}

	/**
	 * Lista apenas os exercícios de um grupo muscular que possuem histórico
	 * executado (com carga registrada) para o aluno, nunca o cadastro geral
	 * de Exercise/WorkoutExercise.
	 */
	public function exercises(Request $request, $student)
	{
		$request->validate([
			'muscle_group_id' => 'required|integer|exists:muscle_groups,id',
		]);

		$trainerId = $request->user()->id;
		$muscleGroupId = $request->input('muscle_group_id');
		$studentProfile = StudentProfile::find($student);

		if (!$studentProfile) {
			return response()->json([
				'message' => 'Aluno não encontrado',
			], 404);
		}

		$exercises = $this->executedCheckinExercisesQuery($studentProfile->id, $trainerId)
			->whereHas('exercise', function ($query) use ($muscleGroupId) {
				$query->where('muscle_group_id', $muscleGroupId);
			})
			->get()
			->pluck('exercise')
			->filter()
			->unique('id')
			->sortBy('name')
			->values()
			->map(fn ($exercise) => ['id' => $exercise->id, 'name' => $exercise->name]);

		return response()->json($exercises);
	}

	/**
	 * Base de todos os filtros de evolução: apenas registros de
	 * WorkoutCheckinExercise pertencentes a check-ins do aluno (escopados ao
	 * trainer autenticado) que possuam ao menos uma série com carga
	 * (performed_weight) de fato registrada. Nunca consulta Workout,
	 * WorkoutExercise ou o cadastro geral de Exercise como fonte.
	 */
	private function executedCheckinExercisesQuery(int $studentProfileId, int $trainerId)
	{
		return WorkoutCheckinExercise::query()
			->whereHas('workoutCheckin', function ($query) use ($studentProfileId, $trainerId) {
				$query->where('student_profile_id', $studentProfileId)
					->whereHas('workout', function ($query) use ($trainerId) {
						$query->where('trainer_id', $trainerId);
					});
			})
			->whereHas('sets', function ($query) {
				$query->whereNotNull('performed_weight');
			})
			->with('exercise.muscleGroup');
	}

	/**
	 * Retorna a evolução de carga/repetições de um exercício para um aluno,
	 * com base exclusivamente no histórico executado (WorkoutCheckin), nunca
	 * na configuração atual do Workout.
	 */
	public function show(Request $request, $student, $exercise)
	{
		$request->validate([
			'muscle_group_id' => 'nullable|integer|exists:muscle_groups,id',
			'start_date' => 'nullable|date',
			'end_date' => 'nullable|date|after_or_equal:start_date',
		]);

		$trainerId = $request->user()->id;
		$muscleGroupId = $request->input('muscle_group_id');
		$startDate = $request->input('start_date');
		$endDate = $request->input('end_date');

		$studentProfile = StudentProfile::find($student);

		if (!$studentProfile) {
			return response()->json([
				'message' => 'Aluno não encontrado',
			], 404);
		}

		$exerciseModel = Exercise::with('muscleGroup')->find($exercise);

		if (!$exerciseModel) {
			return response()->json([
				'message' => 'Exercício não encontrado',
			], 404);
		}

		if ($muscleGroupId && (int) $exerciseModel->muscle_group_id !== (int) $muscleGroupId) {
			return response()->json([
				'message' => 'O exercício informado não pertence ao grupo muscular selecionado',
			], 422);
		}

		$checkins = WorkoutCheckin::query()
			->where('student_profile_id', $studentProfile->id)
			->whereHas('workout', function ($query) use ($trainerId) {
				$query->where('trainer_id', $trainerId);
			})
			->whereHas('exercises', function ($query) use ($exerciseModel) {
				$query->where('exercise_id', $exerciseModel->id);
			})
			->with(['exercises' => function ($query) use ($exerciseModel) {
				$query->where('exercise_id', $exerciseModel->id)->with('sets');
			}])
			->when($startDate, function ($query) use ($startDate) {
				$query->whereDate('performed_at', '>=', $startDate);
			})
			->when($endDate, function ($query) use ($endDate) {
				$query->whereDate('performed_at', '<=', $endDate);
			})
			->orderBy('performed_at')
			->get();

		$points = collect();
		$allSets = collect();

		foreach ($checkins as $checkin) {
			$sets = $checkin->exercises->flatMap->sets;
			$allSets = $allSets->concat($sets);

			// Regra de negócio: quando um check-in registra múltiplas séries do
			// mesmo exercício, o ponto do gráfico daquele dia utiliza a série de
			// MAIOR CARGA (performed_weight). As repetições exibidas são sempre
			// as da própria série de maior carga, e não a maior repetição isolada.
			$bestSet = $sets
				->filter(fn ($set) => $set->performed_weight !== null)
				->sortByDesc(fn ($set) => (float) $set->performed_weight)
				->first();

			if (!$bestSet) {
				continue;
			}

			$points->push([
				'performed_at' => $checkin->performed_at->format('Y-m-d'),
				'weight' => (float) $bestSet->performed_weight,
				'repetitions' => $bestSet->performed_repetitions,
			]);
		}

		$firstPoint = $points->first();
		$lastPoint = $points->last();

		$weightEvolutionPercentage = null;
		if ($firstPoint && $lastPoint && $firstPoint['weight'] > 0) {
			$weightEvolutionPercentage = round(
				(($lastPoint['weight'] - $firstPoint['weight']) / $firstPoint['weight']) * 100,
				2
			);
		}

		$recordedWeights = $allSets->pluck('performed_weight')
			->filter(fn ($weight) => $weight !== null)
			->map(fn ($weight) => (float) $weight);

		$recordedRepetitions = $allSets->pluck('performed_repetitions')
			->filter(fn ($repetitions) => $repetitions !== null);

		return response()->json([
			'exercise' => [
				'id' => $exerciseModel->id,
				'name' => $exerciseModel->name,
				'muscle_group' => $exerciseModel->muscleGroup ? [
					'id' => $exerciseModel->muscleGroup->id,
					'name' => $exerciseModel->muscleGroup->name,
				] : null,
			],
			'points' => $points->values(),
			'summary' => [
				'max_weight' => $recordedWeights->isNotEmpty() ? $recordedWeights->max() : null,
				'max_repetitions' => $recordedRepetitions->isNotEmpty() ? $recordedRepetitions->max() : null,
				'first_performed_at' => $firstPoint['performed_at'] ?? null,
				'last_performed_at' => $lastPoint['performed_at'] ?? null,
				'total_checkins' => $points->count(),
				'weight_evolution_percentage' => $weightEvolutionPercentage,
			],
		]);
	}
}
