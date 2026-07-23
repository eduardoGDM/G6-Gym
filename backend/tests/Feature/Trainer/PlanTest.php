<?php

namespace Tests\Feature\Trainer;

use App\Models\Plan;
use App\Models\StudentProfile;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlanTest extends TestCase
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

	private function assignPlan(User $trainer, string $code): void
	{
		$trainer->subscriptions()->create([
			'plan_id' => Plan::where('code', $code)->value('id'),
			'status' => Subscription::STATUS_ACTIVE,
			'starts_at' => now(),
			'source' => Subscription::SOURCE_MANUAL,
		]);
	}

	public function test_trainer_sees_their_plan_and_usage(): void
	{
		$trainer = $this->createTrainerWithStudents(12);
		$this->assignPlan($trainer, 'essencial');

		$response = $this->actingAs($trainer)->getJson('/api/trainer/plan');

		$response->assertOk();
		$response->assertJsonPath('plan.code', 'essencial');
		$response->assertJsonPath('plan.student_limit', 50);
		$response->assertJsonPath('usage.students', 12);
		$response->assertJsonPath('usage.students_limit', 50);
		$response->assertJsonPath('plan.features.physical_assessment', true);
		$response->assertJsonPath('plan.features.videos', false);
	}

	/**
	 * Preço é assunto do admin. A negociação acontece fora do sistema, então o
	 * valor não deve nem trafegar até o personal.
	 */
	public function test_price_is_never_exposed_to_the_trainer(): void
	{
		$trainer = $this->createTrainerWithStudents();
		$this->assignPlan($trainer, 'standard');

		$this->actingAs($trainer)
			->getJson('/api/trainer/plan')
			->assertOk()
			->assertJsonMissingPath('plan.price_cents');

		$response = $this->actingAs($trainer)->getJson('/api/trainer/plans');
		$response->assertOk();

		foreach (range(0, 3) as $index) {
			$response->assertJsonMissingPath("{$index}.price_cents");
		}
	}

	public function test_trainer_without_plan_still_sees_the_usage(): void
	{
		$trainer = $this->createTrainerWithStudents(5);

		$response = $this->actingAs($trainer)->getJson('/api/trainer/plan');

		$response->assertOk();
		$response->assertJsonPath('plan', null);
		$response->assertJsonPath('subscription', null);
		$response->assertJsonPath('usage.students', 5);
		$response->assertJsonPath('usage.students_limit', null);
	}

	public function test_unlimited_plan_has_no_student_limit(): void
	{
		$trainer = $this->createTrainerWithStudents(3);
		$this->assignPlan($trainer, 'pro');

		$response = $this->actingAs($trainer)->getJson('/api/trainer/plan');

		$response->assertOk();
		$response->assertJsonPath('plan.code', 'pro');
		$response->assertJsonPath('usage.students_limit', null);
	}

	/**
	 * O plano é hoje puramente informativo: nada no sistema é bloqueado por
	 * causa dele. Este teste trava esse contrato — se algum dia um gate for
	 * adicionado, ele precisa ser uma decisão consciente, não um efeito colateral.
	 */
	public function test_plan_does_not_block_creating_students_beyond_the_limit(): void
	{
		$trainer = $this->createTrainerWithStudents(3);
		$this->assignPlan($trainer, 'free');

		$response = $this->actingAs($trainer)->postJson('/api/trainer/student-profiles', [
			'name' => 'Aluno Quatro',
			'email' => 'aluno.quatro@teste.com',
			'password' => '123456',
			'cpf' => '529.982.247-25',
		]);

		$response->assertCreated();
	}

	public function test_student_cannot_access_the_trainer_plan_endpoint(): void
	{
		$studentUser = User::factory()->create(['role' => 'student']);

		$this->actingAs($studentUser)->getJson('/api/trainer/plan')->assertStatus(403);
		$this->actingAs($studentUser)->getJson('/api/trainer/plans')->assertStatus(403);
	}

	public function test_trainer_sees_the_whole_ladder_with_their_plan_marked(): void
	{
		$trainer = $this->createTrainerWithStudents();
		$this->assignPlan($trainer, 'pro');

		$response = $this->actingAs($trainer)->getJson('/api/trainer/plans');

		$response->assertOk();
		$response->assertJsonCount(4);
		$response->assertJsonPath('0.code', 'free');
		$response->assertJsonPath('0.is_current', false);
		$response->assertJsonPath('3.code', 'pro');
		$response->assertJsonPath('3.is_current', true);
	}

	public function test_ladder_matches_the_final_model(): void
	{
		$trainer = $this->createTrainerWithStudents();

		$response = $this->actingAs($trainer)->getJson('/api/trainer/plans');

		$response->assertOk();
		$response->assertJsonCount(4);

		// Free: 3 alunos, sem mídia.
		$response->assertJsonPath('0.code', 'free');
		$response->assertJsonPath('0.student_limit', 3);
		$response->assertJsonPath('0.features.photos', false);
		$response->assertJsonPath('0.features.videos', false);

		// Standard: capacidade real, ainda sem mídia — é o que o torna barato
		// de servir.
		$response->assertJsonPath('1.code', 'standard');
		$response->assertJsonPath('1.student_limit', 20);
		$response->assertJsonPath('1.features.photos', false);
		$response->assertJsonPath('1.features.videos', false);

		// Essencial abre fotos; vídeo só no Pro, que é o teto sem limite.
		$response->assertJsonPath('2.code', 'essencial');
		$response->assertJsonPath('2.student_limit', 50);
		$response->assertJsonPath('2.features.photos', true);
		$response->assertJsonPath('2.features.videos', false);

		$response->assertJsonPath('3.code', 'pro');
		$response->assertJsonPath('3.student_limit', null);
		$response->assertJsonPath('3.features.videos', true);

		// Avaliação física e PDF estão em todos os degraus.
		foreach (range(0, 3) as $index) {
			$response->assertJsonPath("{$index}.features.physical_assessment", true);
			$response->assertJsonPath("{$index}.features.pdf", true);
		}
	}

	public function test_subscription_with_due_date_reports_days_left(): void
	{
		$trainer = $this->createTrainerWithStudents();

		$trainer->subscriptions()->create([
			'plan_id' => Plan::where('code', 'essencial')->value('id'),
			'status' => Subscription::STATUS_ACTIVE,
			'starts_at' => now(),
			'ends_at' => now()->addDays(30),
			'source' => Subscription::SOURCE_MANUAL,
		]);

		$response = $this->actingAs($trainer)->getJson('/api/trainer/plan');

		$response->assertOk();
		$response->assertJsonPath('subscription.days_left', 30);
	}

	public function test_subscription_without_due_date_has_no_days_left(): void
	{
		$trainer = $this->createTrainerWithStudents();
		$this->assignPlan($trainer, 'pro');

		$response = $this->actingAs($trainer)->getJson('/api/trainer/plan');

		$response->assertOk();
		$response->assertJsonPath('subscription.days_left', null);
	}
}
