<?php

namespace Tests\Feature\Trainer;

use App\Models\PhysicalAssessment;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentPhysicalAssessmentTest extends TestCase
{
	use RefreshDatabase;

	private function createStudent(?User $trainer = null, array $attributes = []): StudentProfile
	{
		$studentUser = User::factory()->create(['role' => 'student']);

		return StudentProfile::create([
			'user_id' => $studentUser->id,
			'trainer_id' => $trainer?->id,
			'cpf' => fake()->unique()->numerify('###########'),
			'phone' => '11999999999',
			...$attributes,
		]);
	}

	public function test_trainer_can_list_assessments_from_the_most_recent(): void
	{
		$trainer = User::factory()->create(['role' => 'trainer']);
		$student = $this->createStudent($trainer);

		$student->physicalAssessments()->create(['assessment_date' => '2026-01-10', 'weight' => 80]);
		$student->physicalAssessments()->create(['assessment_date' => '2026-03-10', 'weight' => 78]);

		$response = $this->actingAs($trainer)->getJson(
			"/api/trainer/students/{$student->id}/physical-assessments",
		);

		$response->assertOk();
		$response->assertJsonCount(2, 'data');
		$response->assertJsonPath('data.0.assessment_date', '2026-03-10');
		$response->assertJsonPath('data.1.assessment_date', '2026-01-10');
	}

	public function test_trainer_can_create_an_assessment(): void
	{
		$trainer = User::factory()->create(['role' => 'trainer']);
		$student = $this->createStudent($trainer);

		$response = $this->actingAs($trainer)->postJson(
			"/api/trainer/students/{$student->id}/physical-assessments",
			[
				'assessment_date' => '2026-02-01',
				'weight' => 82.5,
				'waist' => 88,
				'notes' => 'Primeira avaliação.',
			],
		);

		$response->assertCreated();
		$response->assertJsonPath('assessment.measures.weight.value', 82.5);
		$this->assertDatabaseHas('physical_assessments', [
			'student_profile_id' => $student->id,
			'trainer_id' => $trainer->id,
			'weight' => 82.5,
		]);
	}

	public function test_assessment_without_any_measure_is_rejected(): void
	{
		$trainer = User::factory()->create(['role' => 'trainer']);
		$student = $this->createStudent($trainer);

		$response = $this->actingAs($trainer)->postJson(
			"/api/trainer/students/{$student->id}/physical-assessments",
			['assessment_date' => '2026-02-01', 'notes' => 'Só uma anotação.'],
		);

		$response->assertStatus(422);
		$this->assertDatabaseCount('physical_assessments', 0);
	}

	public function test_assessment_without_date_is_rejected(): void
	{
		$trainer = User::factory()->create(['role' => 'trainer']);
		$student = $this->createStudent($trainer);

		$response = $this->actingAs($trainer)->postJson(
			"/api/trainer/students/{$student->id}/physical-assessments",
			['weight' => 80],
		);

		$response->assertStatus(422);
		$response->assertJsonValidationErrors('assessment_date');
	}

	public function test_derived_values_are_calculated_on_read(): void
	{
		$trainer = User::factory()->create(['role' => 'trainer']);
		$student = $this->createStudent($trainer, ['height' => 1.80]);

		$student->physicalAssessments()->create([
			'assessment_date' => '2026-02-01',
			'weight' => 81,
			'fat_percentage' => 20,
			'waist' => 90,
			'hip' => 100,
		]);

		$response = $this->actingAs($trainer)->getJson(
			"/api/trainer/students/{$student->id}/physical-assessments",
		);

		$response->assertOk();
		// IMC = 81 / 1.80² = 25.0
		$response->assertJsonPath('data.0.derived.imc.value', 25);
		// RCQ = 90 / 100 = 0.9
		$response->assertJsonPath('data.0.derived.waist_hip_ratio.value', 0.9);
		// Massa gorda = 81 * 20% = 16.2 | Massa magra = 81 - 16.2 = 64.8
		$response->assertJsonPath('data.0.derived.fat_mass.value', 16.2);
		$response->assertJsonPath('data.0.derived.lean_mass.value', 64.8);
	}

	public function test_assessment_height_overrides_the_profile_height_in_the_imc(): void
	{
		$trainer = User::factory()->create(['role' => 'trainer']);
		$student = $this->createStudent($trainer, ['height' => 1.80]);

		$student->physicalAssessments()->create([
			'assessment_date' => '2026-02-01',
			'weight' => 64,
			'height' => 1.60,
		]);

		$response = $this->actingAs($trainer)->getJson(
			"/api/trainer/students/{$student->id}/physical-assessments",
		);

		// 64 / 1.60² = 25.0 (e não 64 / 1.80² = 19.75)
		$response->assertJsonPath('data.0.derived.imc.value', 25);
	}

	public function test_each_measure_carries_the_delta_from_the_previous_assessment(): void
	{
		$trainer = User::factory()->create(['role' => 'trainer']);
		$student = $this->createStudent($trainer, ['height' => 1.80]);

		$student->physicalAssessments()->create([
			'assessment_date' => '2026-01-01',
			'weight' => 84,
			'waist' => 90,
		]);
		$student->physicalAssessments()->create([
			'assessment_date' => '2026-03-01',
			'weight' => 81,
			'waist' => 88,
		]);

		$response = $this->actingAs($trainer)->getJson(
			"/api/trainer/students/{$student->id}/physical-assessments",
		);

		$response->assertOk();
		$response->assertJsonPath('data.0.measures.waist.delta', -2);
		$response->assertJsonPath('data.0.measures.weight.delta', -3);
		// IMC: 25.0 - 25.93 = -0.93
		$response->assertJsonPath('data.0.derived.imc.delta', -0.93);
		// A avaliação mais antiga não tem anterior para comparar.
		$response->assertJsonPath('data.1.measures.waist.delta', null);
	}

	public function test_muscle_mass_is_stored_as_typed_and_is_not_the_lean_mass(): void
	{
		$trainer = User::factory()->create(['role' => 'trainer']);
		$student = $this->createStudent($trainer);

		$student->physicalAssessments()->create([
			'assessment_date' => '2026-02-01',
			'weight' => 81,
			'fat_percentage' => 20,
			'muscle_mass' => 35,
		]);

		$response = $this->actingAs($trainer)->getJson(
			"/api/trainer/students/{$student->id}/physical-assessments",
		);

		$response->assertJsonPath('data.0.measures.muscle_mass.value', 35);
		$response->assertJsonPath('data.0.derived.lean_mass.value', 64.8);
	}

	public function test_trainer_can_update_an_assessment(): void
	{
		$trainer = User::factory()->create(['role' => 'trainer']);
		$student = $this->createStudent($trainer);

		$assessment = $student->physicalAssessments()->create([
			'assessment_date' => '2026-02-01',
			'weight' => 80,
		]);

		$response = $this->actingAs($trainer)->putJson(
			"/api/trainer/students/{$student->id}/physical-assessments/{$assessment->id}",
			['assessment_date' => '2026-02-02', 'weight' => 79.4],
		);

		$response->assertOk();
		$this->assertDatabaseHas('physical_assessments', [
			'id' => $assessment->id,
			'weight' => 79.4,
		]);
		$this->assertSame(
			'2026-02-02',
			$assessment->refresh()->assessment_date->toDateString(),
		);
	}

	public function test_trainer_can_delete_an_assessment(): void
	{
		$trainer = User::factory()->create(['role' => 'trainer']);
		$student = $this->createStudent($trainer);

		$assessment = $student->physicalAssessments()->create([
			'assessment_date' => '2026-02-01',
			'weight' => 80,
		]);

		$response = $this->actingAs($trainer)->deleteJson(
			"/api/trainer/students/{$student->id}/physical-assessments/{$assessment->id}",
		);

		$response->assertOk();
		$this->assertDatabaseMissing('physical_assessments', ['id' => $assessment->id]);
	}

	public function test_trainer_cannot_access_assessments_of_another_trainers_student(): void
	{
		$trainer = User::factory()->create(['role' => 'trainer']);
		$otherTrainer = User::factory()->create(['role' => 'trainer']);
		$student = $this->createStudent($otherTrainer);

		$assessment = $student->physicalAssessments()->create([
			'assessment_date' => '2026-02-01',
			'weight' => 80,
		]);

		$this->actingAs($trainer)
			->getJson("/api/trainer/students/{$student->id}/physical-assessments")
			->assertStatus(404);

		$this->actingAs($trainer)
			->postJson("/api/trainer/students/{$student->id}/physical-assessments", [
				'assessment_date' => '2026-02-02',
				'weight' => 81,
			])
			->assertStatus(404);

		$this->actingAs($trainer)
			->putJson("/api/trainer/students/{$student->id}/physical-assessments/{$assessment->id}", [
				'assessment_date' => '2026-02-02',
				'weight' => 81,
			])
			->assertStatus(404);

		$this->actingAs($trainer)
			->deleteJson("/api/trainer/students/{$student->id}/physical-assessments/{$assessment->id}")
			->assertStatus(404);

		$this->assertDatabaseHas('physical_assessments', ['id' => $assessment->id, 'weight' => 80]);
	}

	public function test_assessment_of_another_student_cannot_be_reached_through_a_valid_student(): void
	{
		$trainer = User::factory()->create(['role' => 'trainer']);
		$student = $this->createStudent($trainer);
		$otherStudent = $this->createStudent($trainer);

		$assessment = $otherStudent->physicalAssessments()->create([
			'assessment_date' => '2026-02-01',
			'weight' => 80,
		]);

		$response = $this->actingAs($trainer)->deleteJson(
			"/api/trainer/students/{$student->id}/physical-assessments/{$assessment->id}",
		);

		$response->assertStatus(404);
		$this->assertDatabaseHas('physical_assessments', ['id' => $assessment->id]);
	}

	public function test_student_cannot_access_physical_assessments(): void
	{
		$studentUser = User::factory()->create(['role' => 'student']);
		$student = $this->createStudent();

		$response = $this->actingAs($studentUser)->getJson(
			"/api/trainer/students/{$student->id}/physical-assessments",
		);

		$response->assertStatus(403);
	}

	public function test_admin_can_access_physical_assessments(): void
	{
		$admin = User::factory()->create(['role' => 'admin']);
		$student = $this->createStudent();

		$response = $this->actingAs($admin)->getJson(
			"/api/trainer/students/{$student->id}/physical-assessments",
		);

		$response->assertOk();
	}

	public function test_current_weight_backfill_preserved_the_weight_as_an_assessment(): void
	{
		// A migration de remoção do current_weight roda antes deste teste (o banco
		// já está migrado), então a checagem é feita reexecutando o backfill sobre
		// uma coluna recriada: down() restaura o campo, up() volta a convertê-lo.
		$student = $this->createStudent(null, ['height' => 1.80]);

		$migration = require database_path(
			'migrations/2026_07_23_000002_drop_current_weight_from_student_profiles_table.php',
		);

		$migration->down();

		\Illuminate\Support\Facades\DB::table('student_profiles')
			->where('id', $student->id)
			->update(['current_weight' => 77.7]);

		$migration->up();

		$this->assertDatabaseHas('physical_assessments', [
			'student_profile_id' => $student->id,
			'weight' => 77.7,
		]);

		$assessment = PhysicalAssessment::where('student_profile_id', $student->id)->first();
		$this->assertSame(
			$student->created_at->toDateString(),
			$assessment->assessment_date->toDateString(),
		);
	}
}
