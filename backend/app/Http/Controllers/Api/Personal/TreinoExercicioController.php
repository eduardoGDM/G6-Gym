<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\TreinoExercicio;

class TreinoExercicioController extends Controller
{
	public function index($treinoId)
	{
		return response()->json(
			TreinoExercicio::with(['exercicio', 'metodoTreino'])
				->where('treino_id', $treinoId)
				->orderBy('ordem')
				->get()
		);
	}

	public function store(Request $request)
	{
		$request->validate([
			'treino_id' => 'required|exists:treinos,id',
			'exercicio_id' => 'required|exists:exercicios,id',
			'metodo_treino_id' => 'nullable|exists:metodo_treinos,id',
			'ordem' => 'nullable|integer|min:1',
			'series_aquecimento' => 'nullable|integer|min:0',
			'series_reconhecimento' => 'nullable|integer|min:0',
			'series_validas' => 'required|integer|min:1',
			'repeticoes' => 'nullable|string|max:50',
			'rir' => 'nullable|integer|min:0|max:10',
			'descanso_segundos' => 'nullable|integer|min:0',
			'cadencia' => 'nullable|string|max:20',
			'carga' => 'nullable|numeric|min:0',

			'observacoes' => 'nullable|string',
		]);

		$treinoExercicio = TreinoExercicio::create([
			'treino_id' => $request->treino_id,
			'exercicio_id' => $request->exercicio_id,
			'metodo_treino_id' => $request->metodo_treino_id,
			'ordem' => $request->ordem ?? 1,
			'series_aquecimento' => $request->series_aquecimento,
			'series_reconhecimento' => $request->series_reconhecimento,
			'series_validas' => $request->series_validas,
			'repeticoes' => $request->repeticoes,
			'rir' => $request->rir,
			'descanso_segundos' => $request->descanso_segundos,
			'cadencia' => $request->cadencia,

			'carga' => $request->carga,
			'observacoes' => $request->observacoes,
		]);

		return response()->json([
			'message' => 'Exercício adicionado ao treino com sucesso',
			'treino_exercicio' => $treinoExercicio
		], 201);
	}

	public function show($id)
	{
		$treinoExercicio = TreinoExercicio::with(['exercicio', 'metodoTreino', 'treino'])
			->find($id);

		if (!$treinoExercicio) {
			return response()->json([
				'message' => 'Registro não encontrado'
			], 404);
		}

		return response()->json($treinoExercicio);
	}

	public function update(Request $request, $id)
	{
		$treinoExercicio = TreinoExercicio::find($id);

		if (!$treinoExercicio) {
			return response()->json([
				'message' => 'Registro não encontrado'
			], 404);
		}

		$request->validate([
			'ordem' => 'sometimes|integer|min:1',
			'series_aquecimento' => 'nullable|integer|min:0',
			'series_reconhecimento' => 'nullable|integer|min:0',
			'series_validas' => 'nullable|integer|min:1',
			'repeticoes' => 'nullable|string|max:50',
			'rir' => 'nullable|integer|min:0|max:10',
			'descanso_segundos' => 'nullable|integer|min:0',
			'cadencia' => 'nullable|string|max:20',
			'carga' => 'nullable|numeric|min:0',
			'observacoes' => 'nullable|string',
		]);

		$treinoExercicio->update($request->only([
			'ordem',
			'series_aquecimento',
			'series_reconhecimento',
			'series_validas',
			'repeticoes',
			'rir',
			'descanso_segundos',
			'cadencia',
			'carga',
			'observacoes',
		]));

		return response()->json([
			'message' => 'Exercício do treino atualizado com sucesso',
			'treino_exercicio' => $treinoExercicio
		]);
	}

	public function destroy($id)
	{
		$treinoExercicio = TreinoExercicio::find($id);

		if (!$treinoExercicio) {
			return response()->json([
				'message' => 'Registro não encontrado'
			], 404);
		}

		$treinoExercicio->delete();

		return response()->json([
			'message' => 'Exercício removido do treino com sucesso'
		]);
	}
}
