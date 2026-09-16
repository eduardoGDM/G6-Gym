<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureStudentCanManageWorkouts
{
	/**
	 * Libera a autogestão de treinos apenas para alunos autorizados pelo personal.
	 *
	 * A flag é lida do banco a cada requisição (e não da sessão), para que a
	 * revogação pelo personal bloqueie o aluno já na próxima chamada. Um aluno
	 * sem personal vinculado também é bloqueado: o treino precisa de um trainer_id.
	 */
	public function handle(Request $request, Closure $next)
	{
		$profile = $request->user()?->studentProfile()->first();

		if (!$profile || !$profile->can_manage_workouts || !$profile->trainer_id) {
			return response()->json([
				'message' => 'Você não tem permissão para gerenciar seus treinos.',
				'code' => 'WORKOUT_MANAGEMENT_DISABLED',
			], 403);
		}

		return $next($request);
	}
}
