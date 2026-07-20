<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Http\Resources\DailyCheckinResource;
use App\Models\DailyCheckin;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class DailyCheckinController extends Controller
{
	private const VALIDATION_RULES = [
		'date' => 'required|date|before_or_equal:today',
		'sleep_rating' => 'required|integer|min:0|max:10',
		'sleep_notes' => 'nullable|string',
		'diet_rating' => 'required|integer|min:0|max:10',
		'diet_notes' => 'nullable|string',
	];

	private const DUPLICATE_MESSAGE = 'Já existe um Check-in Diário cadastrado para essa data.';

	private function resolveProfile(Request $request)
	{
		return $request->user()->studentProfile;
	}

	public function index(Request $request)
	{
		$profile = $this->resolveProfile($request);

		if (!$profile) {
			return response()->json([
				'message' => 'Perfil de student não encontrado'
			], 404);
		}

		$date = $request->input('date');
		$perPage = (int) $request->input('per_page', 10);

		$checkins = DailyCheckin::where('student_profile_id', $profile->id)
			->when($date, fn ($query) => $query->whereDate('date', $date))
			->orderBy('date', 'desc')
			->orderBy('created_at', 'desc')
			->paginate($perPage);

		return DailyCheckinResource::collection($checkins);
	}

	public function store(Request $request)
	{
		$profile = $this->resolveProfile($request);

		if (!$profile) {
			return response()->json([
				'message' => 'Perfil de student não encontrado'
			], 404);
		}

		$request->validate(self::VALIDATION_RULES);

		$exists = DailyCheckin::where('student_profile_id', $profile->id)
			->whereDate('date', $request->date)
			->exists();

		if ($exists) {
			throw ValidationException::withMessages([
				'date' => self::DUPLICATE_MESSAGE,
			]);
		}

		$checkin = DailyCheckin::create([
			'student_profile_id' => $profile->id,
			'date' => $request->date,
			'sleep_rating' => $request->sleep_rating,
			'sleep_notes' => $request->sleep_notes,
			'diet_rating' => $request->diet_rating,
			'diet_notes' => $request->diet_notes,
		]);

		return (new DailyCheckinResource($checkin))
			->additional(['message' => 'Check-in Diário registrado com sucesso'])
			->response()
			->setStatusCode(201);
	}

	public function reminder(Request $request)
	{
		$profile = $this->resolveProfile($request);

		if (!$profile) {
			return response()->json([
				'message' => 'Perfil de student não encontrado'
			], 404);
		}

		$expectedDate = now()->subDay()->toDateString();

		$exists = DailyCheckin::where('student_profile_id', $profile->id)
			->whereDate('date', $expectedDate)
			->exists();

		return response()->json([
			'pending' => !$exists,
			'expected_date' => $expectedDate,
		]);
	}

	public function update(Request $request, $id)
	{
		$profile = $this->resolveProfile($request);

		if (!$profile) {
			return response()->json([
				'message' => 'Perfil de student não encontrado'
			], 404);
		}

		$checkin = DailyCheckin::where('student_profile_id', $profile->id)
			->where('id', $id)
			->first();

		if (!$checkin) {
			return response()->json([
				'message' => 'Check-in Diário não encontrado'
			], 404);
		}

		$request->validate(self::VALIDATION_RULES);

		$exists = DailyCheckin::where('student_profile_id', $profile->id)
			->whereDate('date', $request->date)
			->where('id', '!=', $checkin->id)
			->exists();

		if ($exists) {
			throw ValidationException::withMessages([
				'date' => self::DUPLICATE_MESSAGE,
			]);
		}

		$checkin->update([
			'date' => $request->date,
			'sleep_rating' => $request->sleep_rating,
			'sleep_notes' => $request->sleep_notes,
			'diet_rating' => $request->diet_rating,
			'diet_notes' => $request->diet_notes,
		]);

		return (new DailyCheckinResource($checkin))
			->additional(['message' => 'Check-in Diário atualizado com sucesso']);
	}
}
