<?php

namespace Tests\Feature;

use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccountStatusTest extends TestCase
{
	use RefreshDatabase;

	public function test_deactivated_user_is_blocked_on_role_protected_routes(): void
	{
		$student = User::factory()->create([
			'role' => 'student',
			'is_active' => false,
		]);

		$response = $this->actingAs($student)->getJson('/api/student/daily-checkins');

		$response->assertStatus(403);
		$response->assertJson(['code' => 'ACCOUNT_INACTIVE']);
	}

	public function test_active_user_passes_role_protected_routes(): void
	{
		$student = User::factory()->create([
			'role' => 'student',
			'is_active' => true,
		]);

		StudentProfile::create([
			'user_id' => $student->id,
			'cpf' => fake()->unique()->numerify('###########'),
			'phone' => '11999999999',
		]);

		$response = $this->actingAs($student)->getJson('/api/student/daily-checkins');

		$response->assertStatus(200);
	}

	public function test_removing_a_student_deactivates_the_user_and_blocks_access(): void
	{
		$trainer = User::factory()->create(['role' => 'trainer']);
		$student = User::factory()->create(['role' => 'student']);

		$profile = StudentProfile::create([
			'user_id' => $student->id,
			'trainer_id' => $trainer->id,
			'cpf' => fake()->unique()->numerify('###########'),
			'phone' => '11999999999',
		]);

		$this->actingAs($trainer)
			->deleteJson("/api/trainer/student-profiles/{$profile->id}")
			->assertStatus(200);

		$this->assertSoftDeleted('student_profiles', ['id' => $profile->id]);
		$this->assertDatabaseHas('users', [
			'id' => $student->id,
			'is_active' => false,
		]);

		// O aluno removido não consegue mais acessar rotas protegidas.
		$this->actingAs($student->fresh())
			->getJson('/api/student/daily-checkins')
			->assertStatus(403);
	}
}
