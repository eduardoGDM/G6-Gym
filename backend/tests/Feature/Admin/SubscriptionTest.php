<?php

namespace Tests\Feature\Admin;

use App\Models\Plan;
use App\Models\StudentProfile;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubscriptionTest extends TestCase
{
	use RefreshDatabase;

	private function createTrainerWithStudents(int $students = 0): User
	{
		$trainer = User::factory()->create(['role' => 'trainer']);

		for ($i = 0; $i < $students; $i++) {
			StudentProfile::create([
				'user_id' => User::factory()->create(['role' => 'student'])->id,
				'trainer_id' => $trainer->id,
				'cpf' => fake()->unique()->numerify('###########'),
			]);
		}

		return $trainer;
	}

	public function test_plans_ladder_is_seeded_by_the_migration(): void
	{
		$admin = User::factory()->create(['role' => 'admin']);

		$response = $this->actingAs($admin)->getJson('/api/admin/plans');

		$response->assertOk();
		$response->assertJsonCount(4, 'data');
		$response->assertJsonPath('data.0.code', 'free');
		// Free é demonstração, não ferramenta de trabalho.
		$response->assertJsonPath('data.0.student_limit', 1);
		$response->assertJsonPath('data.1.code', 'essencial');
		$response->assertJsonPath('data.1.price_cents', 6990);
		$response->assertJsonPath('data.3.code', 'ilimitado');
		// Ilimitado não tem teto de alunos.
		$response->assertJsonPath('data.3.student_limit', null);
	}

	public function test_admin_can_assign_a_plan_to_a_trainer(): void
	{
		$admin = User::factory()->create(['role' => 'admin']);
		$trainer = $this->createTrainerWithStudents();

		$response = $this->actingAs($admin)->putJson(
			"/api/admin/trainers/{$trainer->id}/subscription",
			['plan_code' => 'essencial', 'notes' => 'Teste de validação do modelo.'],
		);

		$response->assertOk();
		$response->assertJsonPath('subscription.plan.code', 'essencial');

		$this->assertDatabaseHas('subscriptions', [
			'trainer_id' => $trainer->id,
			'status' => Subscription::STATUS_ACTIVE,
			'source' => Subscription::SOURCE_MANUAL,
			'assigned_by' => $admin->id,
		]);
	}

	public function test_changing_the_plan_keeps_the_previous_subscription_as_history(): void
	{
		$admin = User::factory()->create(['role' => 'admin']);
		$trainer = $this->createTrainerWithStudents();

		$this->actingAs($admin)->putJson(
			"/api/admin/trainers/{$trainer->id}/subscription",
			['plan_code' => 'essencial'],
		)->assertOk();

		$this->actingAs($admin)->putJson(
			"/api/admin/trainers/{$trainer->id}/subscription",
			['plan_code' => 'pro'],
		)->assertOk();

		// Duas linhas: a antiga cancelada, a nova ativa.
		$this->assertSame(2, $trainer->subscriptions()->count());
		$this->assertSame(
			1,
			$trainer->subscriptions()->where('status', Subscription::STATUS_ACTIVE)->count(),
		);

		$trainer->refresh()->load('currentSubscription.plan');
		$this->assertSame('pro', $trainer->currentSubscription->plan->code);
	}

	public function test_admin_can_remove_the_active_plan(): void
	{
		$admin = User::factory()->create(['role' => 'admin']);
		$trainer = $this->createTrainerWithStudents();

		$this->actingAs($admin)->putJson(
			"/api/admin/trainers/{$trainer->id}/subscription",
			['plan_code' => 'pro'],
		)->assertOk();

		$this->actingAs($admin)
			->deleteJson("/api/admin/trainers/{$trainer->id}/subscription")
			->assertOk();

		$this->assertNull($trainer->refresh()->currentSubscription);
	}

	public function test_expired_subscription_is_not_current(): void
	{
		$trainer = $this->createTrainerWithStudents();
		$plan = Plan::where('code', 'pro')->first();

		$trainer->subscriptions()->create([
			'plan_id' => $plan->id,
			'status' => Subscription::STATUS_ACTIVE,
			'starts_at' => now()->subMonths(2),
			'ends_at' => now()->subDay(),
			'source' => Subscription::SOURCE_MANUAL,
		]);

		$this->assertNull($trainer->refresh()->currentSubscription);
	}

	public function test_assigning_an_unknown_plan_is_rejected(): void
	{
		$admin = User::factory()->create(['role' => 'admin']);
		$trainer = $this->createTrainerWithStudents();

		$this->actingAs($admin)->putJson(
			"/api/admin/trainers/{$trainer->id}/subscription",
			['plan_code' => 'platinum'],
		)->assertStatus(422);
	}

	public function test_trainer_list_shows_the_plan_and_the_student_usage(): void
	{
		$admin = User::factory()->create(['role' => 'admin']);
		$trainer = $this->createTrainerWithStudents(4);

		$this->actingAs($admin)->putJson(
			"/api/admin/trainers/{$trainer->id}/subscription",
			['plan_code' => 'free'],
		)->assertOk();

		$response = $this->actingAs($admin)->getJson('/api/admin/trainers');

		$response->assertOk();
		$response->assertJsonPath('data.0.plan.code', 'free');
		$response->assertJsonPath('data.0.plan.student_limit', 1);
		// 4 alunos num plano de 1: exatamente o estouro que queremos enxergar.
		$response->assertJsonPath('data.0.students_count', 4);
	}

	public function test_trainer_without_plan_is_listed_with_null_plan(): void
	{
		$admin = User::factory()->create(['role' => 'admin']);
		$this->createTrainerWithStudents(2);

		$response = $this->actingAs($admin)->getJson('/api/admin/trainers');

		$response->assertOk();
		$response->assertJsonPath('data.0.plan', null);
		$response->assertJsonPath('data.0.students_count', 2);
	}

	public function test_trainer_cannot_assign_plans(): void
	{
		$trainer = $this->createTrainerWithStudents();

		$this->actingAs($trainer)
			->putJson("/api/admin/trainers/{$trainer->id}/subscription", ['plan_code' => 'pro'])
			->assertStatus(403);

		$this->actingAs($trainer)->getJson('/api/admin/plans')->assertStatus(403);
	}

	public function test_assigning_a_plan_to_a_non_trainer_returns_404(): void
	{
		$admin = User::factory()->create(['role' => 'admin']);
		$studentUser = User::factory()->create(['role' => 'student']);

		$this->actingAs($admin)->putJson(
			"/api/admin/trainers/{$studentUser->id}/subscription",
			['plan_code' => 'pro'],
		)->assertStatus(404);
	}
}
