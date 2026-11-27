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
	 * Página padrão: as duas execuções mais recentes, o suficiente para a dica
	 * "Última vez" comparar com a última vez que o aluno fez o exercício. Quem
	 * quer o log completo pede `per_page` maior.
	 */
	private const DEFAULT_PER_PAGE = 2;

	/** Teto de `per_page`, para uma query maliciosa não despejar a tabela. */
	private const MAX_PER_PAGE = 20;

	/**
	 * Histórico executado de um exercício para o aluno autenticado: as
	 * últimas execuções, do check-in mais recente para o mais antigo. A fonte é
	 * exclusivamente o WorkoutCheckin do próprio aluno (nunca a prescrição atual
	 * nem dados de outros usuários); os campos de prescrição vêm do snapshot
	 * congelado no momento do check-in.
	 *
	 * O check-in em edição (exclude_checkin_id) é sempre removido do resultado:
	 * como o autosave já grava o check-in atual no banco enquanto o aluno o
	 * preenche, ele nunca deve competir com — nem esconder — as execuções
	 * anteriores que este histórico existe para comparar.
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

		$excludeCheckinId = $request->query('exclude_checkin_id');

		// Valor ausente, zero, negativo ou não numérico cai no padrão; acima do
		// teto é limitado.
		$requestedPerPage = (int) $request->query('per_page', self::DEFAULT_PER_PAGE);
		$perPage = $requestedPerPage > 0
			? min($requestedPerPage, self::MAX_PER_PAGE)
			: self::DEFAULT_PER_PAGE;

		$history = WorkoutCheckin::query()
			->where('student_profile_id', $profile->id)
			->when($excludeCheckinId, fn ($query) => $query->whereKeyNot($excludeCheckinId))
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
			->paginate($perPage);

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
