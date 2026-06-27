<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\PerfilAluno;

class PerfilAlunoController extends Controller
{
	public function index()
	{
		return response()->json(
			PerfilAluno::with('usuario')->get()
		);
	}

	public function store(Request $request)
	{
		$request->validate([
			'name' => 'required|string|max:255',
			'email' => 'required|email|unique:users,email',
			'password' => 'required|string|min:6',
			'cpf' => 'required|string|size:14|unique:perfil_alunos,cpf',
			'telefone' => 'nullable|string|max:20',
			'data_nascimento' => 'nullable|date|before:today',
			'sexo' => 'nullable|in:Masculino,Feminino,Outro',
			'altura' => 'nullable|numeric|min:0|max:3',
			'peso_atual' => 'nullable|numeric|min:0|max:500',
			'foto' => 'nullable|string|max:255',
			'observacoes' => 'nullable|string',
		]);

		$user = User::create([
			'name' => $request->name,
			'email' => $request->email,
			'password' => bcrypt($request->password),
		]);

		$perfil = PerfilAluno::create([
			'user_id' => $user->id,
			'cpf' => $request->cpf,
			'telefone' => $request->telefone,
			'data_nascimento' => $request->data_nascimento,
			'sexo' => $request->sexo,
			'altura' => $request->altura,
			'peso_atual' => $request->peso_atual,
			'foto' => $request->foto,
			'observacoes' => $request->observacoes,
		]);

		return response()->json([
			'message' => 'Aluno criado com sucesso',
			'user' => $user,
			'perfil' => $perfil
		], 201);
	}

	public function show($id)
	{
		$perfil = PerfilAluno::with('usuario')->find($id);

		if (!$perfil) {
			return response()->json(['message' => 'Aluno não encontrado'], 404);
		}

		return response()->json($perfil);
	}

	public function update(Request $request, $id)
	{
		$perfil = PerfilAluno::find($id);

		if (!$perfil) {
			return response()->json(['message' => 'Aluno não encontrado'], 404);
		}

		$request->validate([
			'cpf' => 'sometimes|string|size:14|unique:perfil_alunos,cpf,' . $id,
			'telefone' => 'nullable|string|max:20',
			'data_nascimento' => 'nullable|date|before:today',
			'sexo' => 'nullable|in:Masculino,Feminino,Outro',
			'altura' => 'nullable|numeric|min:0|max:3',
			'peso_atual' => 'nullable|numeric|min:0|max:500',
			'foto' => 'nullable|string|max:255',
			'observacoes' => 'nullable|string',
		]);

		$perfil->update($request->only([
			'cpf',
			'telefone',
			'data_nascimento',
			'sexo',
			'altura',
			'peso_atual',
			'foto',
			'observacoes'
		]));

		return response()->json([
			'message' => 'Aluno atualizado com sucesso',
			'perfil' => $perfil
		]);
	}

	public function destroy($id)
	{
		$perfil = PerfilAluno::find($id);

		if (!$perfil) {
			return response()->json(['message' => 'Aluno não encontrado'], 404);
		}

		$perfil->usuario()->delete();

		$perfil->delete();

		return response()->json([
			'message' => 'Aluno removido com sucesso'
		]);
	}
}
