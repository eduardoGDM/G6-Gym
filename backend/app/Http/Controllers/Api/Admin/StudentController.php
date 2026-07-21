<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\StudentResource;
use App\Models\User;
use Illuminate\Http\Request;

class StudentController extends Controller
{
	public function index(Request $request)
	{
		$request->validate([
			'name' => 'nullable|string|max:255',
			'email' => 'nullable|string|max:255',
			'trainer' => 'nullable|string|max:255',
			'per_page' => 'nullable|integer|min:1|max:100',
		]);

		$name = $request->input('name');
		$email = $request->input('email');
		$trainerSearch = $request->input('trainer');
		$perPage = (int) $request->input('per_page', 10);

		$students = User::query()
			->where('role', 'student')
			->with(['studentProfile.latestWorkout.trainer:id,name'])
			->when($name, function ($query) use ($name) {
				$query->where('name', 'like', "%{$name}%");
			})
			->when($email, function ($query) use ($email) {
				$query->where('email', 'like', "%{$email}%");
			})
			->when($trainerSearch, function ($query) use ($trainerSearch) {
				$query->whereHas('studentProfile', function ($query) use ($trainerSearch) {
					$query->whereHas('latestWorkout', function ($query) use ($trainerSearch) {
						$query->whereHas('trainer', function ($query) use ($trainerSearch) {
							$query->where('name', 'like', "%{$trainerSearch}%");
						});
					});
				});
			})
			->orderBy('created_at', 'desc')
			->paginate($perPage);

		return StudentResource::collection($students);
	}

	public function updateStatus(Request $request, $id)
	{
		$request->validate([
			'is_active' => 'required|boolean',
		]);

		$student = User::where('role', 'student')->find($id);

		if (!$student) {
			return response()->json([
				'message' => 'Aluno não encontrado'
			], 404);
		}

		$student->update(['is_active' => $request->boolean('is_active')]);

		return response()->json([
			'message' => $student->is_active
				? 'Aluno ativado com sucesso'
				: 'Aluno desativado com sucesso',
			'user' => $student,
		]);
	}
}
