<?php

namespace App\Http\Controllers\Api\Trainer;

use App\Http\Controllers\Controller;
use App\Http\Resources\WorkoutCheckinResource;
use App\Models\StudentProfile;
use App\Models\WorkoutCheckin;
use Illuminate\Http\Request;

class WorkoutCheckinController extends Controller
{
	private const CHECKIN_RELATIONS = [
		'studentProfile.user',
		'workout.trainer',
		'exercises.exercise.muscleGroup',
		'exercises.sets',
	];

	/**
	 * Restringe sempre a check-ins dos alunos vinculados ao trainer autenticado
	 * através do FK student_profiles.trainer_id.
	 */
	private function scopeToTrainer($query, int $trainerId)
	{
		return $query->whereHas('studentProfile', function ($query) use ($trainerId) {
			$query->where('trainer_id', $trainerId);
		});
	}

	public function index(Request $request)
	{
		$request->validate([
			'student_profile_id' => 'nullable|integer|exists:student_profiles,id',
			'date' => 'nullable|date',
			'per_page' => 'nullable|integer|min:1|max:100',
		]);

		$trainerId = $request->user()->id;
		$studentProfileId = $request->input('student_profile_id');
		$date = $request->input('date');
		$perPage = (int) $request->input('per_page', 10);

		$checkins = $this->scopeToTrainer(
			WorkoutCheckin::with(['studentProfile.user', 'workout'])->withCount('exercises'),
			$trainerId,
		)
			->when($studentProfileId, function ($query) use ($studentProfileId) {
				$query->where('student_profile_id', $studentProfileId);
			})
			->when($date, function ($query) use ($date) {
				$query->whereDate('performed_at', $date);
			})
			->orderBy('performed_at', 'desc')
			->orderBy('created_at', 'desc')
			->paginate($perPage);

		return WorkoutCheckinResource::collection($checkins);
	}

	public function show(Request $request, $id)
	{
		$trainerId = $request->user()->id;

		$checkin = $this->scopeToTrainer(WorkoutCheckin::with(self::CHECKIN_RELATIONS), $trainerId)
			->where('id', $id)
			->first();

		if (!$checkin) {
			return response()->json([
				'message' => 'Check-in não encontrado'
			], 404);
		}

		return new WorkoutCheckinResource($checkin);
	}

	/**
	 * Lista os alunos vinculados ao trainer autenticado (FK
	 * student_profiles.trainer_id), para alimentar o filtro de aluno da
	 * listagem de check-ins.
	 */
	public function students(Request $request)
	{
		$trainerId = $request->user()->id;

		$students = StudentProfile::with('user')
			->where('trainer_id', $trainerId)
			->get();

		return response()->json($students);
	}
}
