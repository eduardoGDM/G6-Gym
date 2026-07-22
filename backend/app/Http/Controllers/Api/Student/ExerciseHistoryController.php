<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Http\Resources\ExerciseHistoryEntryResource;
use App\Models\Exercise;
use App\Models\WorkoutCheckin;
use Illuminate\Http\Request;

class ExerciseHistoryController extends Controller
{
	/**
	 * Quantidade de execuções (check-ins) mostradas no histórico — apenas as
	 * mais recentes, o suficiente para comparar com a última vez que o aluno
	 * executou o exercício.
	 */
	private const HISTORY_LIMIT = 2;

	/**
	 * Histórico executado de um exercício para o aluno autenticado: as
	 * últimas execuções, do check-in mais recente para o mais antigo. A fonte é
	 * exclusivamente o WorkoutCheckin do próprio aluno (nunca a prescrição atual
	 * nem dados de outros usuários); os campos de prescrição vêm do snapshot
	 * congelado no momento do check-in.
	 */
	public function index(Request $request, $exercise)
	{
		$profile = $request->user()->studentProfile;

		if (!$profile) {
			return response()->json([
				'message' => 'Perfil de student não encontrado',
			], 404);
		}

		$exerciseModel = Exercise::with('muscleGroup')->find($exercise);

		if (!$exerciseModel) {
			return response()->json([
				'message' => 'Exercício não encontrado',
			], 404);
		}

		$history = WorkoutCheckin::query()
			->where('student_profile_id', $profile->id)
			->whereHas('exercises', function ($query) use ($exerciseModel) {
				$query->where('exercise_id', $exerciseModel->id)
					->whereHas('sets', function ($sets) {
						$sets->whereNotNull('performed_weight')
							->orWhereNotNull('performed_repetitions');
					});
			})
			->with(['exercises' => function ($query) use ($exerciseModel) {
				$query->where('exercise_id', $exerciseModel->id)->with('sets');
			}])
			->orderBy('performed_at', 'desc')
			->orderBy('created_at', 'desc')
			->limit(self::HISTORY_LIMIT)
			->get();

		return ExerciseHistoryEntryResource::collection($history)
			->additional([
				'exercise' => [
					'id' => $exerciseModel->id,
					'name' => $exerciseModel->name,
					'muscle_group' => $exerciseModel->muscleGroup ? [
						'id' => $exerciseModel->muscleGroup->id,
						'name' => $exerciseModel->muscleGroup->name,
					] : null,
				],
			]);
	}
}
