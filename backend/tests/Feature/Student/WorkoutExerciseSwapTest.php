<?php

namespace Tests\Feature\Student;

use App\Models\Exercise;
use App\Models\MuscleGroup;
use App\Models\StudentProfile;
use App\Models\User;
use App\Models\Workout;
use App\Models\WorkoutExercise;
use App\Models\WorkoutExerciseSeries;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Troca de exercícios de um treino atribuído pelo personal
 * (PUT /api/student/workout/{id}/exercises).
 *
 * O ponto da feature é o aluno alterar qual exercício ocupa cada posição sem
 * mexer na estrutura prescrita, então a garantia principal aqui é que as séries
 * sobrevivem intactas à troca.
 */
class WorkoutExerciseSwapTest extends TestCase
{
	use RefreshDatabase;

	private User $trainer;

	protected function setUp(): void
	{
		parent::setUp();

		$this->trainer = User::factory()->create(['role' => 'trainer']);
	}

	private function createStudent(bool $canManage = true): User
	{
		$user = User::factory()->create(['role' => 'student']);

		$profile = StudentProfile::create([
			'user_id' => $user->id,
			'trainer_id' => $this->trainer->id,
			'cpf' => fake()->unique()->numerify('###########'),
		]);

		$profile->can_manage_workouts = $canManage;
		$profile->save();

		return $user;
	}

	private function createExercise(string $name): Exercise
	{
		return Exercise::create([
			'muscle_group_id' => MuscleGroup::create(['name' => "Grupo {$name}"])->id,
			'name' => $name,
		]);
	}

	/**
	 * Treino do personal com um exercício prescrito em três séries distintas.
	 */
	private function createWorkout(User $student, Exercise $exercise, array $attributes = []): Workout
	{
		$workout = Workout::create(array_merge([
			'student_profile_id' => $student->studentProfile->id,
			'trainer_id' => $this->trainer->id,
			'created_by' => $this->trainer->id,
			'name' => 'Treino A',
			'start_date' => now()->toDateString(),
			'active' => true,
		], $attributes));

		$workoutExercise = WorkoutExercise::create([
			'workout_id' => $workout->id,
			'exercise_id' => $exercise->id,
			'order' => 1,
			'notes' => 'Cuidar da escápula',
		]);

		foreach ([
			['order' => 1, 'repetitions' => '12', 'weight' => 40, 'rest_time' => 60, 'type' => 'Aquecimento'],
			['order' => 2, 'repetitions' => '7-12', 'weight' => 45, 'rest_time' => 60, 'rir' => '2', 'type' => 'Válida'],
			['order' => 3, 'repetitions' => '8', 'weight' => 50, 'rest_time' => 90, 'type' => 'Válida'],
		] as $series) {
			WorkoutExerciseSeries::create(array_merge(
				['workout_exercise_id' => $workoutExercise->id],
				$series,
			));
		}

		return $workout;
	}

	public function test_student_swaps_the_exercise_keeping_the_prescribed_series(): void
	{
		$student = $this->createStudent();
		$original = $this->createExercise('Supino reto');
		$replacement = $this->createExercise('Supino inclinado');
		$workout = $this->createWorkout($student, $original);

		$workoutExercise = $workout->workoutExercises()->first();
		$seriesBefore = $workoutExercise->series()->get()->toArray();

		$response = $this->actingAs($student)
			->putJson("/api/student/workout/{$workout->id}/exercises", [
				'exercises' => [
					['workout_exercise_id' => $workoutExercise->id, 'exercise_id' => $replacement->id],
				],
			]);

		$response->assertOk();
		$response->assertJsonPath('message', 'Exercícios atualizados com sucesso');

		$this->assertDatabaseHas('workout_exercises', [
			'id' => $workoutExercise->id,
			'exercise_id' => $replacement->id,
			// Posição e observação pertencem à prescrição e não mudam na troca.
			'order' => 1,
			'notes' => 'Cuidar da escápula',
		]);

		// A estrutura é o que a feature promete preservar: mesmas linhas de
		// série, com os mesmos valores e ids.
		$this->assertEquals($seriesBefore, $workoutExercise->series()->get()->toArray());
	}

	public function test_student_without_permission_cannot_swap(): void
	{
		$student = $this->createStudent(canManage: false);
		$original = $this->createExercise('Supino reto');
		$replacement = $this->createExercise('Supino inclinado');
		$workout = $this->createWorkout($student, $original);

		$workoutExercise = $workout->workoutExercises()->first();

		$this->actingAs($student)
			->putJson("/api/student/workout/{$workout->id}/exercises", [
				'exercises' => [
					['workout_exercise_id' => $workoutExercise->id, 'exercise_id' => $replacement->id],
				],
			])
			->assertForbidden();

		$this->assertDatabaseHas('workout_exercises', [
			'id' => $workoutExercise->id,
			'exercise_id' => $original->id,
		]);
	}

	public function test_swap_is_rejected_when_the_exercise_is_already_in_the_workout(): void
	{
		$student = $this->createStudent();
		$first = $this->createExercise('Supino reto');
		$second = $this->createExercise('Crucifixo');
		$workout = $this->createWorkout($student, $first);

		$secondPosition = WorkoutExercise::create([
			'workout_id' => $workout->id,
			'exercise_id' => $second->id,
			'order' => 2,
		]);

		// Duplicaria "Supino reto" no mesmo treino: o snapshot do check-in
		// indexa os exercícios por exercise_id e perderia uma das entradas.
		$this->actingAs($student)
			->putJson("/api/student/workout/{$workout->id}/exercises", [
				'exercises' => [
					['workout_exercise_id' => $secondPosition->id, 'exercise_id' => $first->id],
				],
			])
			->assertStatus(422)
			->assertJsonValidationErrors(['exercises.0.exercise_id']);

		$this->assertDatabaseHas('workout_exercises', [
			'id' => $secondPosition->id,
			'exercise_id' => $second->id,
		]);
	}

	public function test_swap_is_rejected_when_the_position_belongs_to_another_workout(): void
	{
		$student = $this->createStudent();
		$original = $this->createExercise('Supino reto');
		$replacement = $this->createExercise('Supino inclinado');

		$workout = $this->createWorkout($student, $original);
		$otherWorkout = $this->createWorkout($student, $this->createExercise('Agachamento'), [
			'name' => 'Treino B',
		]);

		$foreignPosition = $otherWorkout->workoutExercises()->first();

		$this->actingAs($student)
			->putJson("/api/student/workout/{$workout->id}/exercises", [
				'exercises' => [
					['workout_exercise_id' => $foreignPosition->id, 'exercise_id' => $replacement->id],
				],
			])
			->assertStatus(422)
			->assertJsonValidationErrors(['exercises.0.workout_exercise_id']);
	}

	public function test_student_cannot_swap_exercises_of_another_students_workout(): void
	{
		$owner = $this->createStudent();
		$intruder = $this->createStudent();

		$original = $this->createExercise('Supino reto');
		$replacement = $this->createExercise('Supino inclinado');
		$workout = $this->createWorkout($owner, $original);

		$workoutExercise = $workout->workoutExercises()->first();

		$this->actingAs($intruder)
			->putJson("/api/student/workout/{$workout->id}/exercises", [
				'exercises' => [
					['workout_exercise_id' => $workoutExercise->id, 'exercise_id' => $replacement->id],
				],
			])
			->assertNotFound();

		$this->assertDatabaseHas('workout_exercises', [
			'id' => $workoutExercise->id,
			'exercise_id' => $original->id,
		]);
	}

	public function test_swap_is_blocked_on_an_inactive_workout(): void
	{
		$student = $this->createStudent();
		$original = $this->createExercise('Supino reto');
		$replacement = $this->createExercise('Supino inclinado');
		$workout = $this->createWorkout($student, $original, ['active' => false]);

		$workoutExercise = $workout->workoutExercises()->first();

		$this->actingAs($student)
			->putJson("/api/student/workout/{$workout->id}/exercises", [
				'exercises' => [
					['workout_exercise_id' => $workoutExercise->id, 'exercise_id' => $replacement->id],
				],
			])
			->assertForbidden();
	}
}
