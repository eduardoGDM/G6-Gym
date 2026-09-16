<?php

namespace App\Http\Controllers\Concerns;

use App\Models\StudentProfile;
use App\Models\User;
use App\Models\Workout;
use App\Models\WorkoutExercise;
use App\Models\WorkoutExerciseSeries;
use Barryvdh\DomPDF\Facade\Pdf;
use Symfony\Component\HttpFoundation\Response;

/**
 * Regras de montagem de treino compartilhadas entre o personal
 * (Api/Trainer/WorkoutController) e o aluno com permissão de autogestão
 * (Api/Student/ManagedWorkoutController).
 *
 * Aqui fica apenas o que é igual para os dois papéis: validação de exercícios
 * e séries, gravação dos exercícios e geração da planilha. O escopo de acesso
 * (quais treinos cada um enxerga) continua em cada controller.
 */
trait ManagesWorkouts
{
	protected const WORKOUT_RELATIONS = [
		'studentProfile.user',
		'trainer',
		'muscleGroups',
		'workoutExercises.exercise.muscleGroup',
		'workoutExercises.series',
	];

	protected const EXERCISES_VALIDATION_RULES = [
		'muscle_groups' => 'nullable|array',
		'muscle_groups.*' => 'integer|exists:muscle_groups,id',
		'exercises' => 'nullable|array',
		'exercises.*.exercise_id' => 'required|exists:exercises,id',
		'exercises.*.order' => 'required|integer|min:1',
		'exercises.*.notes' => 'nullable|string',
		'exercises.*.series' => 'nullable|array',
		'exercises.*.series.*.order' => 'required|integer|min:1',
		'exercises.*.series.*.repetitions' => ['nullable', 'string', 'regex:/^(\d+(-\d+)?|\d+(x\d+)+)$/'],
		'exercises.*.series.*.weight' => 'nullable|numeric|min:0',
		'exercises.*.series.*.rest_time' => 'nullable|integer|min:0',
		'exercises.*.series.*.rir' => 'nullable|in:0,1,2,3,4,FALHA',
		'exercises.*.series.*.type' => 'required|in:Aquecimento,Reconhecimento,Válida',
		'exercises.*.series.*.advanced_technique' => 'nullable|in:Drop Set,Muscle Round,Parciais,Backoff Set,Cluster Set',
		'exercises.*.series.*.cadence' => 'nullable|string|max:50',
		'exercises.*.series.*.duration' => 'nullable|integer|min:0',
		'exercises.*.series.*.notes' => 'nullable|string',
	];

	protected const SERIES_VALIDATION_MESSAGES = [
		'exercises.*.series.*.repetitions.regex' => 'Use um número (ex.: 8), uma faixa (ex.: 7-12) ou valores por série (ex.: 6x6x6x6).',
		'exercises.*.series.*.rir.in' => 'RIR inválido.',
		'exercises.*.series.*.type.required' => 'Selecione o tipo da série.',
		'exercises.*.series.*.type.in' => 'Tipo de série inválido.',
		'exercises.*.series.*.advanced_technique.in' => 'Técnica avançada inválida.',
	];

	protected function syncExercises(Workout $workout, array $exercises): void
	{
		foreach ($exercises as $item) {
			$workoutExercise = WorkoutExercise::create([
				'workout_id' => $workout->id,
				'exercise_id' => $item['exercise_id'],
				'order' => $item['order'],
				'notes' => $item['notes'] ?? null,
			]);

			foreach ($item['series'] ?? [] as $series) {
				WorkoutExerciseSeries::create([
					'workout_exercise_id' => $workoutExercise->id,
					'order' => $series['order'],
					'repetitions' => $series['repetitions'] ?? null,
					'weight' => $series['weight'] ?? null,
					'rest_time' => $series['rest_time'] ?? null,
					'rir' => $series['rir'] ?? null,
					'type' => $series['type'] ?? 'Válida',
					'advanced_technique' => $series['advanced_technique'] ?? null,
					'cadence' => $series['cadence'] ?? null,
					'duration' => $series['duration'] ?? null,
					'notes' => $series['notes'] ?? null,
				]);
			}
		}
	}

	/** Planilha (PDF) com os treinos ativos do aluno vinculados ao personal. */
	protected function workoutSheetDownload(StudentProfile $studentProfile, ?User $trainer): Response
	{
		$workouts = Workout::with([
			'muscleGroups',
			'workoutExercises' => function ($query) {
				$query->orderBy('order');
			},
			'workoutExercises.exercise.muscleGroup',
			'workoutExercises.series',
		])
			->where('student_profile_id', $studentProfile->id)
			->where('trainer_id', $studentProfile->trainer_id)
			->where('active', true)
			->orderBy('name')
			->get();

		$pdf = Pdf::loadView('pdf.workout-sheet', [
			'student' => $studentProfile,
			'workouts' => $workouts,
			'trainer' => $trainer,
			'generatedAt' => now(),
		]);

		$fileName = 'ficha-treino-' . str($studentProfile->user->name)->slug() . '.pdf';

		return $pdf->download($fileName);
	}
}
