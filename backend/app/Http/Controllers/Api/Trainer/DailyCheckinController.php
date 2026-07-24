<?php

namespace App\Http\Controllers\Api\Trainer;

use App\Http\Controllers\Controller;
use App\Http\Resources\DailyCheckinResource;
use App\Models\DailyCheckin;
use Illuminate\Http\Request;

class DailyCheckinController extends Controller
{
	/**
	 * Restringe sempre a check-ins diários dos alunos vinculados ao trainer
	 * autenticado através do FK student_profiles.trainer_id.
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
			'student' => 'nullable|string|max:255',
			'date_from' => 'nullable|date',
			'date_to' => 'nullable|date',
			'per_page' => 'nullable|integer|min:1|max:100',
		]);

		$trainerId = $request->user()->id;
		$student = $request->input('student');
		$dateFrom = $request->input('date_from');
		$dateTo = $request->input('date_to');
		$perPage = (int) $request->input('per_page', 10);

		$checkins = $this->scopeToTrainer(
			DailyCheckin::with('studentProfile.user'),
			$trainerId,
		)
			->when($student, function ($query) use ($student) {
				$query->whereHas('studentProfile.user', function ($query) use ($student) {
					$query->where('name', 'like', "%{$student}%");
				});
			})
			->when($dateFrom, function ($query) use ($dateFrom) {
				$query->whereDate('date', '>=', $dateFrom);
			})
			->when($dateTo, function ($query) use ($dateTo) {
				$query->whereDate('date', '<=', $dateTo);
			})
			->orderBy('date', 'desc')
			->orderBy('created_at', 'desc')
			->paginate($perPage);

		return DailyCheckinResource::collection($checkins);
	}

	public function show(Request $request, $id)
	{
		$trainerId = $request->user()->id;

		$checkin = $this->scopeToTrainer(DailyCheckin::with(['studentProfile.user', 'comments.trainer']), $trainerId)
			->where('id', $id)
			->first();

		if (!$checkin) {
			return response()->json([
				'message' => 'Check-in não encontrado'
			], 404);
		}

		return new DailyCheckinResource($checkin);
	}
}
