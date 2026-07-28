<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\Exercise;
use App\Models\WorkoutCheckin;
use App\Models\WorkoutCheckinExercise;
use Illuminate\Http\Request;

class ExerciseEvolutionController extends Controller
{
	/**
	 * Tipos de série que o gráfico de evolução aceita filtrar. Por padrão o
	 * gráfico usa a série "Válida" (carga de trabalho real), mas o aluno pode
	 * optar por analisar Reconhecimento ou Aquecimento.
	 */
	private const SERIES_TYPES = ['Válida', 'Reconhecimento', 'Aquecimento'];
	private const DEFAULT_SERIES_TYPE = 'Válida';

	private function resolveProfile(Request $request)
	{
		return $request->user()->studentProfile;
	}

	/**
	 * Lista os exercícios que o aluno autenticado já executou (com carga
	 * registrada), nunca o cadastro geral de Exercise. Alimenta o autocomplete
	 * de busca por exercício na tela de Evolução do aluno.
	 */
	public function exercises(Request $request)
	{
		$profile = $this->resolveProfile($request);

		if (!$profile) {
			return response()->json([
				'message' => 'Perfil de student não encontrado',
			], 404);
		}

		$exercises = $this->executedCheckinExercisesQuery($profile->id)
			->get()
			->pluck('exercise')
			->filter()
			->unique('id')
			->sortBy('name')
			->values()
			->map(fn ($exercise) => [
				'id' => $exercise->id,
				'name' => $exercise->name,
				'muscle_group' => $exercise->muscleGroup ? [
					'id' => $exercise->muscleGroup->id,
					'name' => $exercise->muscleGroup->name,
				] : null,
			]);

		return response()->json($exercises);
	}

	/**
	 * Base dos filtros: apenas registros de WorkoutCheckinExercise pertencentes
	 * a check-ins do próprio aluno que possuam ao menos uma série com carga
	 * (performed_weight) registrada. Nunca consulta Workout/WorkoutExercise nem
	 * o cadastro geral de Exercise como fonte.
	 */
	private function executedCheckinExercisesQuery(int $studentProfileId)
	{
		return WorkoutCheckinExercise::query()
			->whereHas('workoutCheckin', function ($query) use ($studentProfileId) {
				$query->where('student_profile_id', $studentProfileId);
			})
			->whereHas('sets', function ($query) {
				$query->whereNotNull('performed_weight');
			})
			->with('exercise.muscleGroup');
	}

	/**
	 * Retorna a evolução de carga/repetições de um exercício para o aluno
	 * autenticado, com base exclusivamente no histórico executado
	 * (WorkoutCheckin), nunca na configuração atual do Workout.
	 */
	public function show(Request $request, $exercise)
	{
		$request->validate([
			'series_type' => ['nullable', 'in:' . implode(',', self::SERIES_TYPES)],
			'start_date' => 'nullable|date',
			'end_date' => 'nullable|date|after_or_equal:start_date',
		]);

		$profile = $this->resolveProfile($request);

		if (!$profile) {
			return response()->json([
				'message' => 'Perfil de student não encontrado',
			], 404);
		}

		$seriesType = $request->input('series_type', self::DEFAULT_SERIES_TYPE);
		$startDate = $request->input('start_date');
		$endDate = $request->input('end_date');

		$exerciseModel = Exercise::with('muscleGroup')->find($exercise);

		if (!$exerciseModel) {
			return response()->json([
				'message' => 'Exercício não encontrado',
			], 404);
		}

		$checkins = WorkoutCheckin::query()
			->where('student_profile_id', $profile->id)
			->whereHas('exercises', function ($query) use ($exerciseModel) {
				$query->where('exercise_id', $exerciseModel->id);
			})
			->with(['exercises' => function ($query) use ($exerciseModel, $seriesType) {
				$query->where('exercise_id', $exerciseModel->id)
					->with(['sets' => function ($setsQuery) use ($seriesType) {
						$setsQuery->where('planned_type', $seriesType);
					}]);
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
