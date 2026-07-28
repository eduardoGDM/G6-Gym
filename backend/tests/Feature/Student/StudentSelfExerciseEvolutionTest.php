<?php

namespace Tests\Feature\Student;

use App\Models\Exercise;
use App\Models\MuscleGroup;
use App\Models\StudentProfile;
use App\Models\User;
use App\Models\Workout;
use App\Models\WorkoutCheckin;
use App\Models\WorkoutCheckinExercise;
use App\Models\WorkoutCheckinExerciseSet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentSelfExerciseEvolutionTest extends TestCase
{
	use RefreshDatabase;

	private function createStudentWithWorkout(): array
	{
		$trainer = User::factory()->create(['role' => 'trainer']);
		$studentUser = User::factory()->create(['role' => 'student']);
		$studentProfile = StudentProfile::create([
			'user_id' => $studentUser->id,
			'trainer_id' => $trainer->id,
			'cpf' => fake()->unique()->numerify('###########'),
			'phone' => '11999999999',
		]);

		$muscleGroup = MuscleGroup::create(['name' => 'Peito']);
		$exercise = Exercise::create([
			'muscle_group_id' => $muscleGroup->id,
			'name' => 'Supino reto',
		]);

		$workout = Workout::create([
			'student_profile_id' => $studentProfile->id,
			'trainer_id' => $trainer->id,
			'name' => 'Treino A',
			'start_date' => now(),
			'active' => true,
		]);

		return [$studentUser, $studentProfile, $exercise, $workout];
	}

	private function createCheckinWithSets(
		StudentProfile $studentProfile,
		Workout $workout,
		Exercise $exercise,
		string $performedAt,
		array $sets,
	): WorkoutCheckin {
		$checkin = WorkoutCheckin::create([
			'student_profile_id' => $studentProfile->id,
			'workout_id' => $workout->id,
			'performed_at' => $performedAt,
		]);

		$checkinExercise = WorkoutCheckinExercise::create([
			'workout_checkin_id' => $checkin->id,
			'exercise_id' => $exercise->id,
		]);

		foreach ($sets as $index => $set) {
			WorkoutCheckinExerciseSet::create([
				'workout_checkin_exercise_id' => $checkinExercise->id,
				'set_number' => $index + 1,
				'planned_type' => $set['type'] ?? 'Válida',
				'performed_repetitions' => $set['repetitions'],
				'performed_weight' => $set['weight'],
			]);
		}

		return $checkin;
	}

	public function test_student_lists_only_own_executed_exercises(): void
	{
		[$studentUser, $studentProfile, $exercise, $workout] = $this->createStudentWithWorkout();
		$this->createCheckinWithSets($studentProfile, $workout, $exercise, '2026-06-01', [
			['weight' => 40, 'repetitions' => 10],
		]);

		// Exercício cadastrado mas nunca executado não deve aparecer.
		Exercise::create([
			'muscle_group_id' => $exercise->muscle_group_id,
			'name' => 'Supino inclinado',
		]);

		$response = $this->actingAs($studentUser)->getJson('/api/student/evolution/exercises');

		$response->assertOk();
		$response->assertJsonCount(1);
		$response->assertJsonPath('0.id', $exercise->id);
		$response->assertJsonPath('0.muscle_group.name', 'Peito');
	}

	public function test_student_gets_own_evolution_using_the_highest_load_set_per_checkin(): void
	{
		[$studentUser, $studentProfile, $exercise, $workout] = $this->createStudentWithWorkout();

		$this->createCheckinWithSets($studentProfile, $workout, $exercise, '2026-06-01', [
			['weight' => 40, 'repetitions' => 12],
			['weight' => 45, 'repetitions' => 8],
			['weight' => 42, 'repetitions' => 10],
		]);
		$this->createCheckinWithSets($studentProfile, $workout, $exercise, '2026-06-15', [
			['weight' => 50, 'repetitions' => 6],
		]);

		$response = $this->actingAs($studentUser)->getJson(
			"/api/student/evolution/exercises/{$exercise->id}",
		);

		$response->assertOk();
		$response->assertJsonPath('points.0.performed_at', '2026-06-01');
		$response->assertJsonPath('points.0.weight', 45);
		$response->assertJsonPath('points.0.repetitions', 8);
		$response->assertJsonPath('points.1.weight', 50);
		$response->assertJsonPath('summary.max_weight', 50);
		$response->assertJsonPath('summary.total_checkins', 2);
	}

	public function test_student_can_filter_own_evolution_by_period(): void
	{
		[$studentUser, $studentProfile, $exercise, $workout] = $this->createStudentWithWorkout();

		$this->createCheckinWithSets($studentProfile, $workout, $exercise, '2026-01-01', [
			['weight' => 30, 'repetitions' => 10],
		]);
		$this->createCheckinWithSets($studentProfile, $workout, $exercise, '2026-06-01', [
			['weight' => 40, 'repetitions' => 10],
		]);

		$response = $this->actingAs($studentUser)->getJson(
			"/api/student/evolution/exercises/{$exercise->id}"
				. '?start_date=2026-05-01&end_date=2026-07-01',
		);

		$response->assertOk();
		$response->assertJsonCount(1, 'points');
		$response->assertJsonPath('points.0.performed_at', '2026-06-01');
	}

	public function test_student_evolution_does_not_leak_another_students_history(): void
	{
		[$studentUser, $studentProfile, $exercise, $workout] = $this->createStudentWithWorkout();
		$this->createCheckinWithSets($studentProfile, $workout, $exercise, '2026-06-01', [
			['weight' => 40, 'repetitions' => 10],
		]);

		// Outro aluno executou o MESMO exercício — não pode contaminar o resultado.
		[$otherUser, $otherProfile, , $otherWorkout] = $this->createStudentWithWorkout();
		$this->createCheckinWithSets($otherProfile, $otherWorkout, $exercise, '2026-06-10', [
			['weight' => 200, 'repetitions' => 1],
		]);

		$response = $this->actingAs($otherUser)->getJson(
			"/api/student/evolution/exercises/{$exercise->id}",
		);

		$response->assertOk();
		$response->assertJsonCount(1, 'points');
		$response->assertJsonPath('points.0.weight', 200);
		$response->assertJsonPath('summary.max_weight', 200);
	}

	public function test_student_evolution_defaults_to_valid_series_ignoring_warmups(): void
	{
		[$studentUser, $studentProfile, $exercise, $workout] = $this->createStudentWithWorkout();

		// Aquecimento pesado (60) + série Válida (45): sem series_type o ponto usa
		// a Válida (padrão).
		$this->createCheckinWithSets($studentProfile, $workout, $exercise, '2026-06-01', [
			['weight' => 60, 'repetitions' => 5, 'type' => 'Aquecimento'],
			['weight' => 45, 'repetitions' => 8, 'type' => 'Válida'],
		]);

		$response = $this->actingAs($studentUser)->getJson(
			"/api/student/evolution/exercises/{$exercise->id}",
		);

		$response->assertOk();
		$response->assertJsonCount(1, 'points');
		$response->assertJsonPath('points.0.weight', 45);
		$response->assertJsonPath('summary.max_weight', 45);
	}

	public function test_student_can_filter_evolution_by_selected_series_type(): void
	{
		[$studentUser, $studentProfile, $exercise, $workout] = $this->createStudentWithWorkout();

		$this->createCheckinWithSets($studentProfile, $workout, $exercise, '2026-06-01', [
			['weight' => 60, 'repetitions' => 5, 'type' => 'Aquecimento'],
			['weight' => 45, 'repetitions' => 8, 'type' => 'Válida'],
		]);

		$base = "/api/student/evolution/exercises/{$exercise->id}";

		$this->actingAs($studentUser)->getJson("{$base}?series_type=Aquecimento")
			->assertOk()
			->assertJsonPath('points.0.weight', 60);

		$this->actingAs($studentUser)->getJson("{$base}?series_type=Válida")
			->assertOk()
			->assertJsonPath('points.0.weight', 45);
	}

	public function test_student_exercise_list_is_independent_of_series_type(): void
	{
		[$studentUser, $studentProfile, $exercise, $workout] = $this->createStudentWithWorkout();

		// Exercício executado só como Reconhecimento continua listado; o gráfico
		// padrão (Válida) vem vazio, mas filtrando por Reconhecimento aparece.
		$this->createCheckinWithSets($studentProfile, $workout, $exercise, '2026-06-01', [
			['weight' => 40, 'repetitions' => 10, 'type' => 'Reconhecimento'],
		]);

		$this->actingAs($studentUser)
			->getJson('/api/student/evolution/exercises')
			->assertOk()
			->assertJsonCount(1)
			->assertJsonPath('0.id', $exercise->id);

		$base = "/api/student/evolution/exercises/{$exercise->id}";

		$this->actingAs($studentUser)->getJson($base)
			->assertOk()
			->assertJsonCount(0, 'points');

		$this->actingAs($studentUser)->getJson("{$base}?series_type=Reconhecimento")
			->assertOk()
			->assertJsonCount(1, 'points')
			->assertJsonPath('points.0.weight', 40);
	}

	public function test_trainer_cannot_access_student_evolution_endpoints(): void
	{
		$trainer = User::factory()->create(['role' => 'trainer']);

		$this->actingAs($trainer)
			->getJson('/api/student/evolution/exercises')
			->assertStatus(403);
	}
}
