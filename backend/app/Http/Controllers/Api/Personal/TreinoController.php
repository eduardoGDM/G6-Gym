<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Treino;

class TreinoController extends Controller
{
	public function index()
	{
		return response()->json(
			Treino::with(['perfilAluno.usuario', 'personal', 'treinoExercicios'])
				->get()
		);
	}

	public function store(Request $request)
	{
		$request->validate([
			'perfil_aluno_id' => 'required|exists:perfil_alunos,id',
			'personal_id' => 'nullable|exists:users,id',
			'nome' => 'required|string|max:255',
			'descricao' => 'nullable|string',
			'data_inicio' => 'nullable|date',
			'data_fim' => 'nullable|date|after_or_equal:data_inicio',

			'ativo' => 'nullable|boolean',
		]);

		$treino = Treino::create([
			'perfil_aluno_id' => $request->perfil_aluno_id,
			'personal_id' => $request->personal_id,
			'nome' => $request->nome,
			'descricao' => $request->descricao,
			'data_inicio' => $request->data_inicio,
			'data_fim' => $request->data_fim,
			'ativo' => $request->ativo ?? true,
		]);

		return response()->json([
			'message' => 'Treino criado com sucesso',
			'treino' => $treino
		], 201);
	}

	public function show($id)
	{
		$treino = Treino::with(['perfilAluno.usuario', 'personal', 'treinoExercicios'])
			->find($id);

		if (!$treino) {
			return response()->json([
				'message' => 'Treino não encontrado'
			], 404);
		}

		return response()->json($treino);
	}

	public function update(Request $request, $id)
	{
		$treino = Treino::find($id);

		if (!$treino) {
			return response()->json([
				'message' => 'Treino não encontrado'
			], 404);
		}

		$request->validate([
			'nome' => 'sometimes|string|max:255',
			'descricao' => 'nullable|string',

			'data_inicio' => 'nullable|date',
			'data_fim' => 'nullable|date|after_or_equal:data_inicio',

			'ativo' => 'nullable|boolean',
		]);

		$treino->update($request->only([
			'nome',
			'descricao',
			'data_inicio',
			'data_fim',
			'ativo'
		]));

		return response()->json([
			'message' => 'Treino atualizado com sucesso',
			'treino' => $treino
		]);
	}

	public function destroy($id)
	{
		$treino = Treino::find($id);

		if (!$treino) {
			return response()->json([
				'message' => 'Treino não encontrado'
			], 404);
		}

		$treino->delete();

		return response()->json([
			'message' => 'Treino removido com sucesso'
		]);
	}
}
