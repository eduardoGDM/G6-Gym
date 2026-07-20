<?php

namespace Tests\Feature\Student;

use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DailyCheckinTest extends TestCase
{
	use RefreshDatabase;

	private function createStudent(): array
	{
		$studentUser = User::factory()->create(['role' => 'student']);
		$studentProfile = StudentProfile::create([
			'user_id' => $studentUser->id,
			'cpf' => fake()->unique()->numerify('###########'),
			'phone' => '11999999999',
		]);

		return [$studentUser, $studentProfile];
	}

	public function test_student_can_create_a_daily_checkin(): void
	{
		[$studentUser] = $this->createStudent();

		$response = $this->actingAs($studentUser)->postJson('/api/student/daily-checkins', [
			'date' => '2026-07-17',
			'sleep_rating' => 8,
			'sleep_notes' => 'Dormi bem',
			'diet_rating' => 7,
			'diet_notes' => 'Comi certinho',
		]);

		$response->assertStatus(201);
		$this->assertDatabaseHas('daily_checkins', [
			'student_profile_id' => $studentUser->studentProfile->id,
			'date' => '2026-07-17 00:00:00',
			'sleep_rating' => 8,
			'diet_rating' => 7,
		]);
	}

	public function test_student_cannot_create_two_daily_checkins_for_the_same_date(): void
	{
		[$studentUser, $studentProfile] = $this->createStudent();

		$this->actingAs($studentUser)->postJson('/api/student/daily-checkins', [
			'date' => '2026-07-17',
			'sleep_rating' => 8,
			'diet_rating' => 7,
		])->assertStatus(201);

		$response = $this->actingAs($studentUser)->postJson('/api/student/daily-checkins', [
			'date' => '2026-07-17',
			'sleep_rating' => 5,
			'diet_rating' => 5,
		]);

		$response->assertStatus(422);
		$response->assertJsonValidationErrors('date');
		$this->assertSame(1, $studentProfile->dailyCheckins()->count());
	}

	public function test_sleep_and_diet_ratings_must_be_between_zero_and_ten(): void
	{
		[$studentUser] = $this->createStudent();

		$response = $this->actingAs($studentUser)->postJson('/api/student/daily-checkins', [
			'date' => '2026-07-17',
			'sleep_rating' => 11,
			'diet_rating' => -1,
		]);

		$response->assertStatus(422);
		$response->assertJsonValidationErrors(['sleep_rating', 'diet_rating']);
	}

	public function test_student_can_update_a_daily_checkin_keeping_the_same_date(): void
	{
		[$studentUser, $studentProfile] = $this->createStudent();

		$checkinId = $this->actingAs($studentUser)->postJson('/api/student/daily-checkins', [
			'date' => '2026-07-17',
			'sleep_rating' => 8,
			'diet_rating' => 7,
		])->json('data.id');

		$response = $this->actingAs($studentUser)->putJson("/api/student/daily-checkins/{$checkinId}", [
			'date' => '2026-07-17',
			'sleep_rating' => 10,
			'sleep_notes' => 'Atualizado',
			'diet_rating' => 9,
		]);

		$response->assertStatus(200);
		$this->assertDatabaseHas('daily_checkins', [
			'id' => $checkinId,
			'sleep_rating' => 10,
			'sleep_notes' => 'Atualizado',
			'diet_rating' => 9,
		]);
	}

	public function test_student_cannot_update_a_daily_checkin_to_a_date_already_used_by_another_record(): void
	{
		[$studentUser] = $this->createStudent();

		$this->actingAs($studentUser)->postJson('/api/student/daily-checkins', [
			'date' => '2026-07-16',
			'sleep_rating' => 6,
			'diet_rating' => 6,
		]);

		$secondId = $this->actingAs($studentUser)->postJson('/api/student/daily-checkins', [
			'date' => '2026-07-17',
			'sleep_rating' => 8,
			'diet_rating' => 7,
		])->json('data.id');

		$response = $this->actingAs($studentUser)->putJson("/api/student/daily-checkins/{$secondId}", [
			'date' => '2026-07-16',
			'sleep_rating' => 8,
			'diet_rating' => 7,
		]);

		$response->assertStatus(422);
		$response->assertJsonValidationErrors('date');
	}

	public function test_student_can_list_daily_checkins_filtered_by_date_and_paginated(): void
	{
		[$studentUser] = $this->createStudent();

		$this->actingAs($studentUser)->postJson('/api/student/daily-checkins', [
			'date' => '2026-07-15',
			'sleep_rating' => 6,
			'diet_rating' => 6,
		]);
		$this->actingAs($studentUser)->postJson('/api/student/daily-checkins', [
			'date' => '2026-07-16',
			'sleep_rating' => 7,
			'diet_rating' => 7,
		]);

		$response = $this->actingAs($studentUser)->getJson('/api/student/daily-checkins?date=2026-07-16');

		$response->assertStatus(200);
		$response->assertJsonCount(1, 'data');
		$response->assertJsonPath('data.0.date', '2026-07-16');
	}

	public function test_student_cannot_see_daily_checkins_from_another_student(): void
	{
		[$studentUserA] = $this->createStudent();
		[$studentUserB] = $this->createStudent();

		$this->actingAs($studentUserA)->postJson('/api/student/daily-checkins', [
			'date' => '2026-07-17',
			'sleep_rating' => 8,
			'diet_rating' => 7,
		]);

		$response = $this->actingAs($studentUserB)->getJson('/api/student/daily-checkins');

		$response->assertStatus(200);
		$response->assertJsonCount(0, 'data');
	}
}
