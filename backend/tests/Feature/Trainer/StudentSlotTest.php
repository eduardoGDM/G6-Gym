<?php

namespace Tests\Feature\Trainer;

use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Contagem de vaga do plano: uma vaga = um CPF distinto, contabilizada no
 * cadastro do aluno e liberada só 30 dias após a remoção.
 */
class StudentSlotTest extends TestCase
{
	use RefreshDatabase;

	/** CPFs válidos (dígito verificador correto) para os cenários. */
	private const VALID_CPFS = [
		'529.982.247-25',
		'168.995.350-09',
		'111.444.777-35',
	];

	private function createStudentFor(User $trainer, string $cpf): StudentProfile
	{
		return StudentProfile::create([
			'user_id' => User::factory()->create(['role' => 'student'])->id,
			'trainer_id' => $trainer->id,
			'cpf' => $cpf,
		]);
	}

	public function test_slot_is_counted_when_the_student_is_registered(): void
	{
		$trainer = User::factory()->create(['role' => 'trainer']);

		$this->assertSame(0, StudentProfile::usedSlotsFor($trainer->id));

		$this->createStudentFor($trainer, self::VALID_CPFS[0]);
		$this->createStudentFor($trainer, self::VALID_CPFS[1]);

		$this->assertSame(2, StudentProfile::usedSlotsFor($trainer->id));
	}

	public function test_removed_student_keeps_the_slot_during_the_cooldown(): void
	{
		$trainer = User::factory()->create(['role' => 'trainer']);
		$student = $this->createStudentFor($trainer, self::VALID_CPFS[0]);

		$student->delete();

		// Removido agora: a vaga continua ocupada.
		$this->assertSame(1, StudentProfile::usedSlotsFor($trainer->id));

		$student->forceFill([
			'deleted_at' => now()->subDays(StudentProfile::SLOT_RELEASE_DAYS - 1),
		])->saveQuietly();
		$this->assertSame(1, StudentProfile::usedSlotsFor($trainer->id));
	}

	public function test_slot_is_released_after_the_cooldown(): void
	{
		$trainer = User::factory()->create(['role' => 'trainer']);
		$student = $this->createStudentFor($trainer, self::VALID_CPFS[0]);

		$student->delete();
		$student->forceFill([
			'deleted_at' => now()->subDays(StudentProfile::SLOT_RELEASE_DAYS + 1),
		])->saveQuietly();

		$this->assertSame(0, StudentProfile::usedSlotsFor($trainer->id));
	}

	public function test_slots_are_counted_per_trainer(): void
	{
		$trainer = User::factory()->create(['role' => 'trainer']);
		$otherTrainer = User::factory()->create(['role' => 'trainer']);

		$this->createStudentFor($trainer, self::VALID_CPFS[0]);
		$this->createStudentFor($otherTrainer, self::VALID_CPFS[1]);
		$this->createStudentFor($otherTrainer, self::VALID_CPFS[2]);

		$this->assertSame(1, StudentProfile::usedSlotsFor($trainer->id));
		$this->assertSame(2, StudentProfile::usedSlotsFor($otherTrainer->id));
	}

	public function test_trainer_plan_usage_uses_the_slot_rule(): void
	{
		$trainer = User::factory()->create(['role' => 'trainer']);
		$student = $this->createStudentFor($trainer, self::VALID_CPFS[0]);
		$this->createStudentFor($trainer, self::VALID_CPFS[1]);

		$student->delete();

		$response = $this->actingAs($trainer)->getJson('/api/trainer/plan');

		$response->assertOk();
		// O removido ainda ocupa vaga dentro da janela de 30 dias.
		$response->assertJsonPath('usage.students', 2);
	}

	public function test_admin_list_uses_the_same_slot_rule(): void
	{
		$admin = User::factory()->create(['role' => 'admin']);
		$trainer = User::factory()->create(['role' => 'trainer']);

		$recent = $this->createStudentFor($trainer, self::VALID_CPFS[0]);
		$old = $this->createStudentFor($trainer, self::VALID_CPFS[1]);
		$this->createStudentFor($trainer, self::VALID_CPFS[2]);

		$recent->delete();

		$old->delete();
		$old->forceFill([
			'deleted_at' => now()->subDays(StudentProfile::SLOT_RELEASE_DAYS + 1),
		])->saveQuietly();

		$response = $this->actingAs($admin)->getJson('/api/admin/trainers');

		$response->assertOk();
		// 1 ativo + 1 removido recentemente; o removido há mais de 30 dias saiu.
		$response->assertJsonPath('data.0.students_count', 2);
	}

	public function test_registration_rejects_an_invalid_cpf(): void
	{
		$trainer = User::factory()->create(['role' => 'trainer']);

		$response = $this->actingAs($trainer)->postJson('/api/trainer/student-profiles', [
			'name' => 'Aluno Teste',
			'email' => 'aluno.teste@exemplo.com',
			'password' => '123456',
			'cpf' => '123.456.789-00',
		]);

		$response->assertStatus(422);
		$response->assertJsonValidationErrors('cpf');
		$this->assertSame(0, StudentProfile::usedSlotsFor($trainer->id));
	}

	public function test_registration_rejects_a_repeated_digit_cpf(): void
	{
		$trainer = User::factory()->create(['role' => 'trainer']);

		$response = $this->actingAs($trainer)->postJson('/api/trainer/student-profiles', [
			'name' => 'Aluno Teste',
			'email' => 'aluno.teste@exemplo.com',
			'password' => '123456',
			'cpf' => '111.111.111-11',
		]);

		$response->assertStatus(422);
		$response->assertJsonValidationErrors('cpf');
	}

	public function test_registration_accepts_a_valid_cpf_and_counts_the_slot(): void
	{
		$trainer = User::factory()->create(['role' => 'trainer']);

		$response = $this->actingAs($trainer)->postJson('/api/trainer/student-profiles', [
			'name' => 'Aluno Teste',
			'email' => 'aluno.teste@exemplo.com',
			'password' => '123456',
			'cpf' => self::VALID_CPFS[0],
		]);

		$response->assertCreated();
		$this->assertSame(1, StudentProfile::usedSlotsFor($trainer->id));
	}

	public function test_update_rejects_an_invalid_cpf(): void
	{
		$trainer = User::factory()->create(['role' => 'trainer']);
		$student = $this->createStudentFor($trainer, self::VALID_CPFS[0]);

		$response = $this->actingAs($trainer)->putJson(
			"/api/trainer/student-profiles/{$student->id}",
			['cpf' => '999.999.999-99'],
		);

		$response->assertStatus(422);
		$response->assertJsonValidationErrors('cpf');
	}
}
