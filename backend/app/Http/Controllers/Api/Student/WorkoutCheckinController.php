<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Http\Resources\WorkoutCheckinResource;
use App\Models\Workout;
use App\Models\WorkoutCheckin;
use App\Models\WorkoutCheckinExercise;
use App\Models\WorkoutCheckinExerciseSet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WorkoutCheckinController extends Controller
{
	private const EXERCISES_VALIDATION_RULES = [
		'exercises' => 'nullable|array',
		'exercises.*.exercise_id' => 'required|exists:exercises,id',
		'exercises.*.notes' => 'nullable|string',
		'exercises.*.sets' => 'nullable|array',
		'exercises.*.sets.*.id' => 'nullable|integer',
		'exercises.*.sets.*.set_number' => 'nullable|integer|min:1',
		'exercises.*.sets.*.performed_repetitions' => 'nullable|integer|min:0',
		'exercises.*.sets.*.performed_weight' => 'nullable|numeric|min:0',
		'exercises.*.sets.*.performed_rest_time' => 'nullable|integer|min:0',
		'exercises.*.sets.*.notes' => 'nullable|string',
	];

	private const CHECKIN_RELATIONS = ['workout', 'exercises.exercise.muscleGroup', 'exercises.sets'];

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

		$search = $request->input('search');
		$perPage = (int) $request->input('per_page', 10);
		$searchDate = $search ? $this->parseSearchDate($search) : null;

		$checkins = WorkoutCheckin::with('workout')
			->withCount('exercises')
			->where('student_profile_id', $profile->id)
			->when($search, function ($query) use ($searchDate) {
				if ($searchDate) {
					$query->whereDate('performed_at', $searchDate);
				} else {
					$query->whereRaw('1 = 0');
				}
			})
			->orderBy('performed_at', 'desc')
			->orderBy('created_at', 'desc')
			->paginate($perPage);

		return WorkoutCheckinResource::collection($checkins);
	}

	/**
	 * Aceita a data pesquisada em DD/MM/YYYY ou YYYY-MM-DD e normaliza para Y-m-d.
	 * Retorna null quando o formato informado não corresponde a nenhum dos dois.
	 */
	private function parseSearchDate(string $search): ?string
	{
		$search = trim($search);

		foreach (['d/m/Y', 'Y-m-d'] as $format) {
			$date = \DateTime::createFromFormat($format, $search);

			if ($date && $date->format($format) === $search) {
				return $date->format('Y-m-d');
			}
		}

		return null;
	}

	public function byDate(Request $request)
	{
		$profile = $this->resolveProfile($request);

		if (!$profile) {
			return response()->json([
				'message' => 'Perfil de student não encontrado'
			], 404);
		}

		$request->validate([
			'date' => 'required|date',
		]);

		$checkin = WorkoutCheckin::with(self::CHECKIN_RELATIONS)
			->where('student_profile_id', $profile->id)
			->where('performed_at', $request->query('date'))
			->first();

		if (!$checkin) {
			return response()->json([
				'message' => 'Nenhum check-in encontrado para esta data'
			], 404);
		}

		return new WorkoutCheckinResource($checkin);
	}

	public function show(Request $request, $id)
	{
		$profile = $this->resolveProfile($request);

		if (!$profile) {
			return response()->json([
				'message' => 'Perfil de student não encontrado'
			], 404);
		}

		$checkin = WorkoutCheckin::with(self::CHECKIN_RELATIONS)
			->where('student_profile_id', $profile->id)
			->where('id', $id)
			->first();

		if (!$checkin) {
			return response()->json([
				'message' => 'Check-in não encontrado'
			], 404);
		}

		return new WorkoutCheckinResource($checkin);
	}

	public function store(Request $request)
	{
		$profile = $this->resolveProfile($request);

		if (!$profile) {
			return response()->json([
				'message' => 'Perfil de student não encontrado'
			], 404);
		}

		$request->validate(array_merge([
			'workout_id' => 'required|exists:workouts,id',
			'performed_at' => 'required|date|before_or_equal:today',
			'notes' => 'nullable|string',
		], self::EXERCISES_VALIDATION_RULES));

		$workout = Workout::with('workoutExercises.series')
			->where('student_profile_id', $profile->id)
			->where('id', $request->workout_id)
			->where('active', true)
			->first();

		if (!$workout) {
			return response()->json([
				'message' => 'Treino não encontrado ou não está ativo'
			], 404);
		}

		$checkin = DB::transaction(function () use ($request, $profile, $workout) {
			$checkin = WorkoutCheckin::create([
				'student_profile_id' => $profile->id,
				'workout_id' => $request->workout_id,
				'performed_at' => $request->performed_at,
				'notes' => $request->notes,
			]);

			$workoutExercisesByExerciseId = $workout->workoutExercises->keyBy('exercise_id');

			foreach ($request->input('exercises', []) as $exercise) {
				$this->createCheckinExercise($checkin, $workoutExercisesByExerciseId, $exercise);
			}

			return $checkin;
		});

		$checkin->load(self::CHECKIN_RELATIONS);

		return (new WorkoutCheckinResource($checkin))
			->additional(['message' => 'Check-in registrado com sucesso'])
			->response()
			->setStatusCode(201);
	}

	/**
	 * Cria o registro do exercício e espelha as séries prescritas (WorkoutExerciseSeries)
	 * como um snapshot em WorkoutCheckinExerciseSet, preenchendo os valores executados
	 * informados pelo aluno por número de série.
	 */
	private function createCheckinExercise(WorkoutCheckin $checkin, $workoutExercisesByExerciseId, array $exercise): void
	{
		$workoutExercise = $workoutExercisesByExerciseId->get($exercise['exercise_id']);

		if (!$workoutExercise) {
			return;
		}

		$checkinExercise = WorkoutCheckinExercise::create([
			'workout_checkin_id' => $checkin->id,
			'exercise_id' => $exercise['exercise_id'],
			'notes' => $exercise['notes'] ?? null,
		]);

		$performedBySetNumber = collect($exercise['sets'] ?? [])
			->filter(fn ($set) => isset($set['set_number']))
			->keyBy('set_number');

		foreach ($workoutExercise->series as $series) {
			$performed = $performedBySetNumber->get($series->order);

			WorkoutCheckinExerciseSet::create([
				'workout_checkin_exercise_id' => $checkinExercise->id,
				'set_number' => $series->order,
				'planned_type' => $series->type,
				'planned_repetitions' => $series->repetitions,
				'planned_rir' => $series->rir,
				'performed_repetitions' => $performed['performed_repetitions'] ?? null,
				'planned_weight' => $series->weight,
				'performed_weight' => $performed['performed_weight'] ?? null,
				'planned_rest_time' => $series->rest_time,
				'performed_rest_time' => $performed['performed_rest_time'] ?? null,
				'planned_cadence' => $series->cadence,
				'planned_advanced_technique' => $series->advanced_technique,
				'notes' => $performed['notes'] ?? null,
			]);
		}
	}

	public function update(Request $request, $id)
	{
		$profile = $this->resolveProfile($request);

		if (!$profile) {
			return response()->json([
				'message' => 'Perfil de student não encontrado'
			], 404);
		}

		$checkin = WorkoutCheckin::where('student_profile_id', $profile->id)
			->where('id', $id)
			->first();

		if (!$checkin) {
			return response()->json([
				'message' => 'Check-in não encontrado'
			], 404);
		}

		$request->validate(array_merge([
			'performed_at' => 'sometimes|date|before_or_equal:today',
			'notes' => 'nullable|string',
		], self::EXERCISES_VALIDATION_RULES));

		DB::transaction(function () use ($request, $checkin) {
			$checkin->update($request->only([
				'performed_at',
				'notes',
			]));

			if ($request->has('exercises')) {
				foreach ($request->input('exercises', []) as $exercise) {
					$this->updateCheckinExercise($checkin, $exercise);
				}
			}
		});

		$checkin->load(self::CHECKIN_RELATIONS);

		return (new WorkoutCheckinResource($checkin))
			->additional(['message' => 'Check-in atualizado com sucesso']);
	}

	/**
	 * Atualiza apenas os valores executados (performed_*, notes) do exercício e
	 * de cada série já existentes. O snapshot original (planned_* e quantidade de séries),
	 * criado no momento do check-in, nunca é recalculado a partir do treino atual.
	 */
	private function updateCheckinExercise(WorkoutCheckin $checkin, array $exercise): void
	{
		$checkinExercise = $checkin->exercises()
			->where('exercise_id', $exercise['exercise_id'])
			->first();

		if (!$checkinExercise) {
			return;
		}

		$checkinExercise->update([
			'notes' => $exercise['notes'] ?? null,
		]);

		foreach ($exercise['sets'] ?? [] as $setInput) {
			$setQuery = $checkinExercise->sets();

			$set = isset($setInput['id'])
				? $setQuery->where('id', $setInput['id'])->first()
				: null;

			if (!$set && isset($setInput['set_number'])) {
				$set = $checkinExercise->sets()->where('set_number', $setInput['set_number'])->first();
			}

			if (!$set) {
				continue;
			}

			$set->update([
				'performed_repetitions' => $setInput['performed_repetitions'] ?? null,
				'performed_weight' => $setInput['performed_weight'] ?? null,
				'performed_rest_time' => $setInput['performed_rest_time'] ?? null,
				'notes' => $setInput['notes'] ?? null,
			]);
		}
	}

	/**
	 * Exclusão definitiva do check-in do próprio aluno.
	 *
	 * Os exercícios (workout_checkin_exercises) e as séries (workout_checkin_exercise_sets)
	 * saem junto por cascadeOnDelete declarado nas migrations — não há soft delete,
	 * o registro não é recuperável.
	 *
	 * O escopo por student_profile_id é o que impede um aluno excluir o check-in de outro.
	 */
	public function destroy(Request $request, $id)
	{
		$profile = $this->resolveProfile($request);

		if (!$profile) {
			return response()->json([
				'message' => 'Perfil de student não encontrado'
			], 404);
		}

		$checkin = WorkoutCheckin::where('student_profile_id', $profile->id)
			->where('id', $id)
			->first();

		if (!$checkin) {
			return response()->json([
				'message' => 'Check-in não encontrado'
			], 404);
		}

		$checkin->delete();

		return response()->json([
			'message' => 'Check-in removido com sucesso'
		]);
	}
}
