<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Exercicio;

class ExercicioController extends Controller
{
	public function index()
	{
		return response()->json(
			Exercicio::with('grupoMuscular')->get()
		);
	}

	public function store(Request $request)
	{
		$request->validate([
			'grupo_muscular_id' => 'required|exists:grupos_musculares,id',
			'nome' => 'required|string|max:255',
			'descricao' => 'nullable|string',
			'equipamento' => 'nullable|string|max:255',
			'video_url' => 'nullable|url',
		]);

		$exercicio = Exercicio::create([
			'grupo_muscular_id' => $request->grupo_muscular_id,
			'nome' => $request->nome,
			'descricao' => $request->descricao,
			'equipamento' => $request->equipamento,
			'video_url' => $request->video_url,
		]);

		return response()->json([
			'message' => 'Exercício criado com sucesso',
			'exercicio' => $exercicio
		], 201);
	}

	public function show($id)
	{
		$exercicio = Exercicio::with('grupoMuscular')
			->find($id);

		if (!$exercicio) {
			return response()->json([
				'message' => 'Exercício não encontrado'
			], 404);
		}

		return response()->json($exercicio);
	}

	public function update(Request $request, $id)
	{
		$exercicio = Exercicio::find($id);

		if (!$exercicio) {
			return response()->json([
				'message' => 'Exercício não encontrado'
			], 404);
		}

		$request->validate([
			'grupo_muscular_id' => 'sometimes|exists:grupos_musculares,id',
			'nome' => 'sometimes|string|max:255',
			'descricao' => 'nullable|string',
			'equipamento' => 'nullable|string|max:255',
			'video_url' => 'nullable|url',
		]);

		$exercicio->update($request->only([
			'grupo_muscular_id',
			'nome',
			'descricao',
			'equipamento',
			'video_url',
		]));

		return response()->json([
			'message' => 'Exercício atualizado com sucesso',
			'exercicio' => $exercicio
		]);
	}

	public function destroy($id)
	{
		$exercicio = Exercicio::find($id);

		if (!$exercicio) {
			return response()->json([
				'message' => 'Exercício não encontrado'
			], 404);
		}

		$exercicio->delete();

		return response()->json([
			'message' => 'Exercício removido com sucesso'
		]);
	}
}
