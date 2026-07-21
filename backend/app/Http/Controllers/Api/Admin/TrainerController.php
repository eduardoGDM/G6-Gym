<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\TrainerResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TrainerController extends Controller
{
	public function index(Request $request)
	{
		$request->validate([
			'name' => 'nullable|string|max:255',
			'email' => 'nullable|string|max:255',
			'per_page' => 'nullable|integer|min:1|max:100',
		]);

		$name = $request->input('name');
		$email = $request->input('email');
		$perPage = (int) $request->input('per_page', 10);

		$trainers = User::query()
			->where('role', 'trainer')
			->select('users.*')
			->selectSub(
				DB::table('workouts')
					->selectRaw('count(distinct student_profile_id)')
					->whereColumn('workouts.trainer_id', 'users.id'),
				'students_count'
			)
			->when($name, function ($query) use ($name) {
				$query->where('name', 'like', "%{$name}%");
			})
			->when($email, function ($query) use ($email) {
				$query->where('email', 'like', "%{$email}%");
			})
			->orderBy('created_at', 'desc')
			->paginate($perPage);

		return TrainerResource::collection($trainers);
	}

	public function updateStatus(Request $request, $id)
	{
		$request->validate([
			'is_active' => 'required|boolean',
		]);

		$trainer = User::where('role', 'trainer')->find($id);

		if (!$trainer) {
			return response()->json([
				'message' => 'Personal não encontrado'
			], 404);
		}

		$trainer->update(['is_active' => $request->boolean('is_active')]);

		return response()->json([
			'message' => $trainer->is_active
				? 'Personal ativado com sucesso'
				: 'Personal desativado com sucesso',
			'user' => $trainer,
		]);
	}
}
