<?php

namespace App\Http\Controllers\Api\Aluno;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Treino;

class AlunoTreinoController extends Controller
{
	public function index(Request $request)
	{
		$user = $request->user();

		$perfil = $user->perfilAluno;

		if (!$perfil) {
			return response()->json([
				'message' => 'Perfil de aluno não encontrado'
			], 404);
		}

		$treinos = Treino::with([
			'treinoExercicios.exercicio.grupoMuscular'
		])
			->where('perfil_aluno_id', $perfil->id)
			->where('ativo', true)
			->get();

		return response()->json($treinos);
	}

	// MOSTRAR UM TREINO ESPECÍFICO DO ALUNO
	public function show(Request $request, $id)
	{
		$user = $request->user();

		$perfil = $user->perfilAluno;

		if (!$perfil) {
			return response()->json([
				'message' => 'Perfil de aluno não encontrado'
			], 404);
		}

		$treino = Treino::with([
			'treinoExercicios.exercicio.grupoMuscular'
		])
			->where('perfil_aluno_id', $perfil->id)
			->where('id', $id)
			->first();

		if (!$treino) {
			return response()->json([
				'message' => 'Treino não encontrado'
			], 404);
		}

		return response()->json($treino);
	}
}
