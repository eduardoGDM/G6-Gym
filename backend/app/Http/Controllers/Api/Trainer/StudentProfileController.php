<?php

namespace App\Http\Controllers\Api\Trainer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\StudentProfile;

class StudentProfileController extends Controller
{
	public function index(Request $request)
	{
		return response()->json(
			StudentProfile::with('user')
				->where('trainer_id', $request->user()->id)
				->get()
		);
	}

	public function store(Request $request)
	{
		$request->validate([
			'name' => 'required|string|max:255',
			'email' => 'required|email|unique:users,email',
			'password' => 'required|string|min:6',
			'cpf' => 'required|string|size:14|unique:student_profiles,cpf',
			'phone' => 'nullable|string|max:20',
			'birth_date' => 'nullable|date|before:today',
			'gender' => 'nullable|in:Masculino,Feminino,Outro',
			'height' => 'nullable|numeric|min:0|max:3',
			'current_weight' => 'nullable|numeric|min:0|max:500',
			'photo' => 'nullable|string|max:255',
			'observations' => 'nullable|string',
		]);

		$user = User::create([
			'name' => $request->name,
			'email' => $request->email,
			'password' => bcrypt($request->password),
			'role' => 'student',
		]);

		$profile = StudentProfile::create([
			'user_id' => $user->id,
			'trainer_id' => $request->user()->id,
			'cpf' => $request->cpf,
			'phone' => $request->phone,
			'birth_date' => $request->birth_date,
			'gender' => $request->gender,
			'height' => $request->height,
			'current_weight' => $request->current_weight,
			'photo' => $request->photo,
			'observations' => $request->observations,
		]);

		return response()->json([
			'message' => 'Aluno criado com sucesso',
			'user' => $user,
			'profile' => $profile
		], 201);
	}

	public function show(Request $request, $id)
	{
		$profile = StudentProfile::with('user')
			->where('trainer_id', $request->user()->id)
			->find($id);

		if (!$profile) {
			return response()->json(['message' => 'Aluno não encontrado'], 404);
		}

		return response()->json($profile);
	}

	public function update(Request $request, $id)
	{
		$profile = StudentProfile::where('trainer_id', $request->user()->id)->find($id);

		if (!$profile) {
			return response()->json(['message' => 'Aluno não encontrado'], 404);
		}
		$request->validate([
			'name' => 'sometimes|string|max:255',
			'email' => 'sometimes|email|unique:users,email,' . $profile->user_id,
			'password' => 'nullable|string|min:6',

			'cpf' => 'sometimes|string|size:14|unique:student_profiles,cpf,' . $id,
			'phone' => 'nullable|string|max:20',
			'birth_date' => 'nullable|date|before:today',
			'gender' => 'nullable|in:Masculino,Feminino,Outro',
			'height' => 'nullable|numeric|min:0|max:3',
			'current_weight' => 'nullable|numeric|min:0|max:500',
			'photo' => 'nullable|string|max:255',
			'observations' => 'nullable|string',
		]);

		$user = $profile->user;

		$user->name = $request->name ?? $user->name;
		$user->email = $request->email ?? $user->email;

		if ($request->filled('password')) {
			$user->password = bcrypt($request->password);
		}

		$user->save();

		$profile->update($request->only([
			'cpf',
			'phone',
			'birth_date',
			'gender',
			'height',
			'current_weight',
			'photo',
			'observations'
		]));

		return response()->json([
			'message' => 'Aluno atualizado com sucesso',
			'profile' => $profile
		]);
	}

	public function destroy(Request $request, $id)
	{
		$profile = StudentProfile::where('trainer_id', $request->user()->id)->find($id);

		if (!$profile) {
			return response()->json(['message' => 'Aluno não encontrado'], 404);
		}

		// Soft delete: marca o aluno como removido (deleted_at) sem apagar o
		// registro nem os dados relacionados (workouts, fichas, anamnese, etc).
		// O User NÃO é deletado de propósito: a FK user_id usa cascadeOnDelete,
		// então remover o User apagaria o profile em cascata no banco.
		//
		// O User é apenas desativado (is_active = false): sem isso o aluno
		// "removido" continuaria conseguindo autenticar e ficaria num limbo
		// (profile soft-deleted, mas login válido). As duas operações rodam em
		// transação para não deixar estado inconsistente.
		DB::transaction(function () use ($profile) {
			$profile->user?->update(['is_active' => false]);
			$profile->delete();
		});

		return response()->json([
			'message' => 'Aluno removido com sucesso'
		]);
	}
}
