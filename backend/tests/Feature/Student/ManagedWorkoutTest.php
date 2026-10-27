<?php

namespace Tests\Feature\Student;

use App\Models\Exercise;
use App\Models\MuscleGroup;
use App\Models\StudentProfile;
use App\Models\User;
use App\Models\Workout;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ManagedWorkoutTest extends TestCase
{
	use RefreshDatabase;

	private User $trainer;

	protected function setUp(): void
	{
		parent::setUp();

		$this->trainer = User::factory()->create(['role' => 'trainer']);
	}

	private function createStudent(bool $canManage = true): StudentProfile
	{
		$user = User::factory()->create(['role' => 'student']);

		$profile = StudentProfile::create([
			'user_id' => $user->id,
			'trainer_id' => $this->trainer->id,
			'cpf' => fake()->unique()->numerify('###.###.###-##'),
		]);

		$profile->can_manage_workouts = $canManage;
		$profile->save();

		return $profile;
	}

	private function createWorkout(StudentProfile $profile, User $creator, array $attributes = []): Workout
	{
		return Workout::create(array_merge([
			'student_profile_id' => $profile->id,
			'trainer_id' => $this->trainer->id,
			'created_by' => $creator->id,
			'name' => 'Treino A',
			'start_date' => now()->toDateString(),
			'active' => true,
		], $attributes));
	}

	private function workoutPayload(array $overrides = []): array
	{
		$muscleGroup = MuscleGroup::create(['name' => 'Peito']);
		$exercise = Exercise::create([
			'muscle_group_id' => $muscleGroup->id,
			'name' => 'Supino reto',
		]);

		return array_merge([
			'name' => 'Meu treino',
			'start_date' => now()->toDateString(),
			'muscle_groups' => [$muscleGroup->id],
			'exercises' => [[
				'exercise_id' => $exercise->id,
				'order' => 1,
				'series' => [[
					'order' => 1,
					'repetitions' => '10',
					'type' => 'Válida',
				]],
			]],
		], $overrides);
	}

	public function test_student_without_permission_is_blocked(): void
	{
		$profile = $this->createStudent(canManage: false);

		$this->actingAs($profile->user)
			->getJson('/api/student/managed-workouts')
			->assertForbidden()
			->assertJson(['code' => 'WORKOUT_MANAGEMENT_DISABLED']);

		$this->actingAs($profile->user)
			->postJson('/api/student/managed-workouts', $this->workoutPayload())
			->assertForbidden();

		$this->assertDatabaseCount('workouts', 0);
	}

	public function test_student_creates_workout_scoped_to_own_profile_and_trainer(): void
	{
		$profile = $this->createStudent();
		$otherProfile = $this->createStudent();

		$this->actingAs($profile->user)
			->postJson('/api/student/managed-workouts', $this->workoutPayload([
				// Tentativa de criar para outro aluno deve ser ignorada.
				'student_profile_id' => $otherProfile->id,
				'trainer_id' => 999,
			]))
			->assertCreated();

		$this->assertDatabaseHas('workouts', [
			'name' => 'Meu treino',
			'student_profile_id' => $profile->id,
			'trainer_id' => $this->trainer->id,
			'created_by' => $profile->user_id,
		]);
		$this->assertDatabaseMissing('workouts', ['student_profile_id' => $otherProfile->id]);
	}

	public function test_student_lists_only_own_workouts(): void
	{
		$profile = $this->createStudent();
		$otherProfile = $this->createStudent();

		$this->createWorkout($profile, $this->trainer, ['name' => 'Do personal']);
		$this->createWorkout($profile, $profile->user, ['name' => 'Meu']);
		$this->createWorkout($otherProfile, $otherProfile->user, ['name' => 'De outro aluno']);

		$this->actingAs($profile->user)
			->getJson('/api/student/managed-workouts')
			->assertOk()
			->assertJsonCount(2, 'data')
			->assertJsonMissing(['name' => 'De outro aluno']);
	}

	public function test_student_cannot_access_another_students_workout(): void
	{
		$profile = $this->createStudent();
		$otherProfile = $this->createStudent();
		$workout = $this->createWorkout($otherProfile, $otherProfile->user);

		$this->actingAs($profile->user)
			->getJson("/api/student/managed-workouts/{$workout->id}")
			->assertNotFound();

		$this->actingAs($profile->user)
			->putJson("/api/student/managed-workouts/{$workout->id}", ['name' => 'Invadido'])
			->assertNotFound();

		$this->actingAs($profile->user)
			->deleteJson("/api/student/managed-workouts/{$workout->id}")
			->assertNotFound();

		$this->assertDatabaseHas('workouts', ['id' => $workout->id, 'name' => 'Treino A']);
	}

	public function test_student_can_update_toggle_and_delete_own_created_workout(): void
	{
		$profile = $this->createStudent();
		$workout = $this->createWorkout($profile, $profile->user);

		$this->actingAs($profile->user)
			->putJson("/api/student/managed-workouts/{$workout->id}", ['name' => 'Renomeado', 'active' => false])
			->assertOk();

		$this->assertDatabaseHas('workouts', ['id' => $workout->id, 'name' => 'Renomeado', 'active' => false]);

		$this->actingAs($profile->user)
			->deleteJson("/api/student/managed-workouts/{$workout->id}")
			->assertOk();

		$this->assertDatabaseMissing('workouts', ['id' => $workout->id]);
	}

	/**
	 * Autogestão é completa: quem montou o treino não limita o aluno. Ele
	 * reestrutura e até exclui o treino que veio do personal.
	 */
	public function test_student_can_restructure_workout_created_by_trainer(): void
	{
		$profile = $this->createStudent();
		$workout = $this->createWorkout($profile, $this->trainer);

		$this->actingAs($profile->user)
			->getJson("/api/student/managed-workouts/{$workout->id}")
			->assertOk();

		$this->actingAs($profile->user)
			->putJson(
				"/api/student/managed-workouts/{$workout->id}",
				$this->workoutPayload(['name' => 'Reestruturado'])
			)
			->assertOk();

		$this->assertDatabaseHas('workouts', ['id' => $workout->id, 'name' => 'Reestruturado']);
		$this->assertDatabaseCount('workout_exercises', 1);

		$this->actingAs($profile->user)
			->deleteJson("/api/student/managed-workouts/{$workout->id}")
			->assertOk();

		$this->assertDatabaseMissing('workouts', ['id' => $workout->id]);
	}

	/**
	 * O aluno manda name/start_date/exercises, mas o vínculo é imutável: ele não
	 * consegue mover o treino do personal para outro aluno nem trocar de
	 * personal pelo payload.
	 */
	public function test_student_cannot_rebind_workout_while_editing(): void
	{
		$profile = $this->createStudent();
		$otherProfile = $this->createStudent();
		$workout = $this->createWorkout($profile, $this->trainer);

		$this->actingAs($profile->user)
			->putJson("/api/student/managed-workouts/{$workout->id}", $this->workoutPayload([
				'student_profile_id' => $otherProfile->id,
				'trainer_id' => 999,
			]))
			->assertOk();

		$this->assertDatabaseHas('workouts', [
			'id' => $workout->id,
			'student_profile_id' => $profile->id,
			'trainer_id' => $this->trainer->id,
		]);
	}

	public function test_revoking_permission_blocks_the_next_request(): void
	{
		$profile = $this->createStudent();
		$workout = $this->createWorkout($profile, $profile->user);

		$this->actingAs($profile->user)
			->getJson("/api/student/managed-workouts/{$workout->id}")
			->assertOk();

		$this->actingAs($this->trainer)
			->patchJson("/api/trainer/student-profiles/{$profile->id}/workout-management", [
				'can_manage_workouts' => false,
			])
			->assertOk();

		$this->actingAs($profile->user)
			->putJson("/api/student/managed-workouts/{$workout->id}", ['name' => 'Depois'])
			->assertForbidden()
			->assertJson(['code' => 'WORKOUT_MANAGEMENT_DISABLED']);
	}

	public function test_trainer_cannot_toggle_permission_of_student_not_linked_to_them(): void
	{
		$profile = $this->createStudent(canManage: false);
		$otherTrainer = User::factory()->create(['role' => 'trainer']);

		$this->actingAs($otherTrainer)
			->patchJson("/api/trainer/student-profiles/{$profile->id}/workout-management", [
				'can_manage_workouts' => true,
			])
			->assertNotFound();

		$this->assertFalse($profile->fresh()->can_manage_workouts);
	}

	public function test_trainer_still_sees_and_edits_workouts_created_by_student(): void
	{
		$profile = $this->createStudent();
		$workout = $this->createWorkout($profile, $profile->user);

		$this->actingAs($this->trainer)
			->getJson('/api/trainer/workouts')
			->assertOk()
			->assertJsonCount(1, 'data');

		$this->actingAs($this->trainer)
			->putJson("/api/trainer/workouts/{$workout->id}", ['name' => 'Ajustado pelo personal'])
			->assertOk();

		$this->assertDatabaseHas('workouts', ['id' => $workout->id, 'name' => 'Ajustado pelo personal']);
	}

	public function test_authorized_student_can_download_own_workout_sheet(): void
	{
		$profile = $this->createStudent();
		$this->createWorkout($profile, $profile->user);

		$this->actingAs($profile->user)
			->get('/api/student/managed-workouts/sheet')
			->assertOk()
			->assertHeader('content-type', 'application/pdf');
	}

	public function test_me_exposes_permission_flag_for_student(): void
	{
		$profile = $this->createStudent();

		$this->actingAs($profile->user)
			->getJson('/api/auth/user')
			->assertOk()
			->assertJsonPath('student_profile.can_manage_workouts', true);
	}
}
