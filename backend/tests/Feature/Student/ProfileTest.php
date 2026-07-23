<?php

namespace Tests\Feature\Student;

use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileTest extends TestCase
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

	public function test_student_can_view_their_own_profile(): void
	{
		$trainer = User::factory()->create(['role' => 'trainer', 'name' => 'Personal Ana']);
		$student = $this->createStudent($trainer, ['height' => 1.80]);

		$response = $this->actingAs($student->user)->getJson('/api/student/profile');

		$response->assertOk();
		$response->assertJsonPath('name', $student->user->name);
		$response->assertJsonPath('phone', '11999999999');
		$response->assertJsonPath('trainer.name', 'Personal Ana');
	}

	public function test_profile_weight_comes_from_the_latest_assessment_with_a_weight(): void
	{
		$student = $this->createStudent(null, ['height' => 1.80]);

		$student->physicalAssessments()->create([
			'assessment_date' => '2026-01-10',
			'weight' => 84,
		]);
		$student->physicalAssessments()->create([
			'assessment_date' => '2026-03-10',
			'weight' => 80,
		]);
		// Avaliação mais recente só com circunferência: não deve virar o peso atual.
		$student->physicalAssessments()->create([
			'assessment_date' => '2026-04-10',
			'waist' => 88,
		]);

		$response = $this->actingAs($student->user)->getJson('/api/student/profile');

		$response->assertOk();
		$response->assertJsonPath('latest_weight', '80.00');
		$response->assertJsonPath('latest_weight_date', '2026-03-10');
	}

	public function test_profile_without_assessments_has_no_weight(): void
	{
		$student = $this->createStudent();

		$response = $this->actingAs($student->user)->getJson('/api/student/profile');

		$response->assertOk();
		$response->assertJsonPath('latest_weight', null);
		$response->assertJsonPath('latest_weight_date', null);
	}

	public function test_student_can_list_their_own_assessments_with_deltas(): void
	{
		$student = $this->createStudent(null, ['height' => 1.80]);

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

		$response = $this->actingAs($student->user)->getJson('/api/student/physical-assessments');

		$response->assertOk();
		$response->assertJsonCount(2, 'data');
		$response->assertJsonPath('data.0.assessment_date', '2026-03-01');
		$response->assertJsonPath('data.0.measures.waist.delta', -2);
		$response->assertJsonPath('data.0.derived.imc.value', 25);
		$response->assertJsonPath('data.1.measures.waist.delta', null);
	}

	public function test_student_only_sees_their_own_assessments(): void
	{
		$student = $this->createStudent();
		$otherStudent = $this->createStudent();

		$otherStudent->physicalAssessments()->create([
			'assessment_date' => '2026-03-01',
			'weight' => 81,
		]);

		$response = $this->actingAs($student->user)->getJson('/api/student/physical-assessments');

		$response->assertOk();
		$response->assertJsonCount(0, 'data');
	}

	public function test_trainer_cannot_access_the_student_profile_endpoints(): void
	{
		$trainer = User::factory()->create(['role' => 'trainer']);

		$this->actingAs($trainer)->getJson('/api/student/profile')->assertStatus(403);
		$this->actingAs($trainer)
			->getJson('/api/student/physical-assessments')
			->assertStatus(403);
	}

	public function test_user_without_student_profile_gets_404(): void
	{
		$studentUser = User::factory()->create(['role' => 'student']);

		$this->actingAs($studentUser)
			->getJson('/api/student/profile')
			->assertStatus(404)
			->assertJsonPath('message', 'Perfil de student não encontrado');

		$this->actingAs($studentUser)
			->getJson('/api/student/physical-assessments')
			->assertStatus(404);
	}
}
