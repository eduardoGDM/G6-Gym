<?php

namespace App\Http\Controllers\Api\Trainer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Resources\ExerciseResource;
use App\Models\Exercise;

class ExerciseController extends Controller
{
	public function index(Request $request)
	{
		$request->validate([
			'muscle_groups' => 'nullable|array',
			'muscle_groups.*' => 'integer|exists:muscle_groups,id',
		]);

		$search = $request->input('search');
		$muscleGroups = $request->input('muscle_groups', []);
		$perPage = (int) $request->input('per_page', 10);

		$exercises = Exercise::with('muscleGroup')
			->when($search, function ($query) use ($search) {
				$query->where('name', 'like', "%{$search}%")
					->orWhereHas('muscleGroup', function ($query) use ($search) {
						$query->where('name', 'like', "%{$search}%");
					});
			})
			->when(!empty($muscleGroups), function ($query) use ($muscleGroups) {
				$query->whereIn('muscle_group_id', $muscleGroups);
			})
			->orderBy('name')
			->paginate($perPage);

		return ExerciseResource::collection($exercises);
	}

	public function store(Request $request)
	{
		$request->validate([
			'muscle_group_id' => 'required|exists:muscle_groups,id',
			'name' => 'required|string|max:255',
			'description' => 'nullable|string',
			'equipment' => 'nullable|string|max:255',
			'video_url' => 'nullable|url',
		]);

		$exercise = Exercise::create([
			'muscle_group_id' => $request->muscle_group_id,
			'name' => $request->name,
			'description' => $request->description,
			'equipment' => $request->equipment,
			'video_url' => $request->video_url,
		]);

		return response()->json([
			'message' => 'Exercício criado com sucesso',
			'exercise' => $exercise
		], 201);
	}

	public function show($id)
	{
		$exercise = Exercise::with('muscleGroup')
			->find($id);

		if (!$exercise) {
			return response()->json([
				'message' => 'Exercício não encontrado'
			], 404);
		}

		return response()->json($exercise);
	}

	public function update(Request $request, $id)
	{
		$exercise = Exercise::find($id);

		if (!$exercise) {
			return response()->json([
				'message' => 'Exercício não encontrado'
			], 404);
		}

		$request->validate([
			'muscle_group_id' => 'sometimes|exists:muscle_groups,id',
			'name' => 'sometimes|string|max:255',
			'description' => 'nullable|string',
			'equipment' => 'nullable|string|max:255',
			'video_url' => 'nullable|url',
		]);

		$exercise->update($request->only([
			'muscle_group_id',
			'name',
			'description',
			'equipment',
			'video_url',
		]));

		return response()->json([
			'message' => 'Exercício atualizado com sucesso',
			'exercise' => $exercise
		]);
	}

	public function destroy($id)
	{
		$exercise = Exercise::find($id);

		if (!$exercise) {
			return response()->json([
				'message' => 'Exercício não encontrado'
			], 404);
		}

		$exercise->delete();

		return response()->json([
			'message' => 'Exercício removido com sucesso'
		]);
	}
}
