<?php

namespace Tests\Feature\Trainer;

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

class StudentExerciseEvolutionTest extends TestCase
{
	use RefreshDatabase;

	private function createStudentWithWorkout(User $trainer): array
	{
		$studentUser = User::factory()->create(['role' => 'student']);
		$studentProfile = StudentProfile::create([
			'user_id' => $studentUser->id,
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

		return [$studentProfile, $exercise, $workout, $muscleGroup];
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
				'performed_repetitions' => $set['repetitions'],
				'performed_weight' => $set['weight'],
			]);
		}

		return $checkin;
	}

	public function test_trainer_gets_evolution_using_the_highest_load_set_per_checkin(): void
	{
		$trainer = User::factory()->create(['role' => 'trainer']);
		[$studentProfile, $exercise, $workout] = $this->createStudentWithWorkout($trainer);

		$this->createCheckinWithSets($studentProfile, $workout, $exercise, '2026-06-01', [
			['weight' => 40, 'repetitions' => 12],
			['weight' => 45, 'repetitions' => 8],
			['weight' => 42, 'repetitions' => 10],
		]);

		$this->createCheckinWithSets($studentProfile, $workout, $exercise, '2026-06-15', [
			['weight' => 50, 'repetitions' => 6],
		]);

		$response = $this->actingAs($trainer)->getJson(
			"/api/trainer/students/{$studentProfile->id}/exercises/{$exercise->id}/evolution",
		);

		$response->assertOk();
		$response->assertJsonPath('points.0.performed_at', '2026-06-01');
		$response->assertJsonPath('points.0.weight', 45);
		$response->assertJsonPath('points.0.repetitions', 8);
		$response->assertJsonPath('points.1.performed_at', '2026-06-15');
		$response->assertJsonPath('points.1.weight', 50);
		$response->assertJsonPath('summary.max_weight', 50);
		$response->assertJsonPath('summary.max_repetitions', 12);
		$response->assertJsonPath('summary.total_checkins', 2);
		$response->assertJsonPath('summary.first_performed_at', '2026-06-01');
		$response->assertJsonPath('summary.last_performed_at', '2026-06-15');
	}

	public function test_trainer_can_filter_evolution_by_period(): void
	{
		$trainer = User::factory()->create(['role' => 'trainer']);
		[$studentProfile, $exercise, $workout] = $this->createStudentWithWorkout($trainer);

		$this->createCheckinWithSets($studentProfile, $workout, $exercise, '2026-01-01', [
			['weight' => 30, 'repetitions' => 10],
		]);
		$this->createCheckinWithSets($studentProfile, $workout, $exercise, '2026-06-01', [
			['weight' => 40, 'repetitions' => 10],
		]);

		$response = $this->actingAs($trainer)->getJson(
			"/api/trainer/students/{$studentProfile->id}/exercises/{$exercise->id}/evolution"
				. '?start_date=2026-05-01&end_date=2026-07-01',
		);

		$response->assertOk();
		$response->assertJsonCount(1, 'points');
		$response->assertJsonPath('points.0.performed_at', '2026-06-01');
	}

	public function test_returns_empty_points_when_exercise_has_no_history(): void
	{
		$trainer = User::factory()->create(['role' => 'trainer']);
		[$studentProfile, $exercise] = $this->createStudentWithWorkout($trainer);

		$response = $this->actingAs($trainer)->getJson(
			"/api/trainer/students/{$studentProfile->id}/exercises/{$exercise->id}/evolution",
		);

		$response->assertOk();
		$response->assertJsonCount(0, 'points');
		$response->assertJsonPath('summary.max_weight', null);
		$response->assertJsonPath('summary.total_checkins', 0);
	}

	public function test_trainer_cannot_see_evolution_of_another_trainers_student(): void
	{
		$trainerA = User::factory()->create(['role' => 'trainer']);
		$trainerB = User::factory()->create(['role' => 'trainer']);
		[$studentProfile, $exercise, $workout] = $this->createStudentWithWorkout($trainerA);
		$this->createCheckinWithSets($studentProfile, $workout, $exercise, '2026-06-01', [
			['weight' => 40, 'repetitions' => 10],
		]);

		$response = $this->actingAs($trainerB)->getJson(
			"/api/trainer/students/{$studentProfile->id}/exercises/{$exercise->id}/evolution",
		);

		$response->assertOk();
		$response->assertJsonCount(0, 'points');
	}

	public function test_returns_422_when_exercise_does_not_belong_to_given_muscle_group(): void
	{
		$trainer = User::factory()->create(['role' => 'trainer']);
		[$studentProfile, $exercise] = $this->createStudentWithWorkout($trainer);
		$otherMuscleGroup = MuscleGroup::create(['name' => 'Costas']);

		$response = $this->actingAs($trainer)->getJson(
			"/api/trainer/students/{$studentProfile->id}/exercises/{$exercise->id}/evolution"
				. "?muscle_group_id={$otherMuscleGroup->id}",
		);

		$response->assertStatus(422);
	}

	public function test_muscle_groups_filter_only_lists_groups_with_executed_history(): void
	{
		$trainer = User::factory()->create(['role' => 'trainer']);
		[$studentProfile, $exercise, $workout, $muscleGroup] = $this->createStudentWithWorkout($trainer);
		$this->createCheckinWithSets($studentProfile, $workout, $exercise, '2026-06-01', [
			['weight' => 40, 'repetitions' => 10],
		]);

		// Grupo muscular sem nenhum check-in não deve aparecer no filtro.
		MuscleGroup::create(['name' => 'Ombro']);

		// Exercício com série sem carga registrada (nunca "executado" de fato)
		// também não deve fazer seu grupo aparecer.
		$unexecutedMuscleGroup = MuscleGroup::create(['name' => 'Panturrilha']);
		$unexecutedExercise = Exercise::create([
			'muscle_group_id' => $unexecutedMuscleGroup->id,
			'name' => 'Panturrilha em pé',
		]);
		$this->createCheckinWithSets($studentProfile, $workout, $unexecutedExercise, '2026-06-02', [
			['weight' => null, 'repetitions' => null],
		]);

		$response = $this->actingAs($trainer)->getJson(
			"/api/trainer/students/{$studentProfile->id}/checkins/muscle-groups",
		);

		$response->assertOk();
		$response->assertJsonCount(1);
		$response->assertJsonPath('0.id', $muscleGroup->id);
	}

	public function test_exercises_filter_only_lists_exercises_with_executed_history_in_the_group(): void
	{
		$trainer = User::factory()->create(['role' => 'trainer']);
		[$studentProfile, $exercise, $workout, $muscleGroup] = $this->createStudentWithWorkout($trainer);
		$this->createCheckinWithSets($studentProfile, $workout, $exercise, '2026-06-01', [
			['weight' => 40, 'repetitions' => 10],
		]);

		$otherExerciseSameGroup = Exercise::create([
			'muscle_group_id' => $muscleGroup->id,
			'name' => 'Supino inclinado',
		]);

		$response = $this->actingAs($trainer)->getJson(
			"/api/trainer/students/{$studentProfile->id}/checkins/exercises"
				. "?muscle_group_id={$muscleGroup->id}",
		);

		$response->assertOk();
		$response->assertJsonCount(1);
		$response->assertJsonPath('0.id', $exercise->id);
		$response->assertJsonMissing(['id' => $otherExerciseSameGroup->id]);
	}

	public function test_filters_are_empty_when_student_has_no_checkins(): void
	{
		$trainer = User::factory()->create(['role' => 'trainer']);
		[$studentProfile] = $this->createStudentWithWorkout($trainer);

		$response = $this->actingAs($trainer)->getJson(
			"/api/trainer/students/{$studentProfile->id}/checkins/muscle-groups",
		);

		$response->assertOk();
		$response->assertJsonCount(0);
	}

	public function test_filters_do_not_leak_muscle_groups_from_another_trainers_student(): void
	{
		$trainerA = User::factory()->create(['role' => 'trainer']);
		$trainerB = User::factory()->create(['role' => 'trainer']);
		[$studentProfile, $exercise, $workout] = $this->createStudentWithWorkout($trainerA);
		$this->createCheckinWithSets($studentProfile, $workout, $exercise, '2026-06-01', [
			['weight' => 40, 'repetitions' => 10],
		]);

		$response = $this->actingAs($trainerB)->getJson(
			"/api/trainer/students/{$studentProfile->id}/checkins/muscle-groups",
		);

		$response->assertOk();
		$response->assertJsonCount(0);
	}
}
