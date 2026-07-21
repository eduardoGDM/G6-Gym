<?php

namespace Tests\Feature\Student;

use App\Models\DailyCheckin;
use App\Models\StudentProfile;
use App\Models\User;
use App\Models\Workout;
use App\Models\WorkoutCheckin;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class GamificationTest extends TestCase
{
	use RefreshDatabase;

	private function createStudentWithWorkout(): array
	{
		$trainer = User::factory()->create(['role' => 'trainer']);
		$studentUser = User::factory()->create(['role' => 'student']);
		$studentProfile = StudentProfile::create([
			'user_id' => $studentUser->id,
			'cpf' => fake()->unique()->numerify('###########'),
			'phone' => '11999999999',
		]);

		$workout = Workout::create([
			'student_profile_id' => $studentProfile->id,
			'trainer_id' => $trainer->id,
			'name' => 'Treino A',
			'start_date' => now(),
			'active' => true,
		]);

		return [$studentUser, $studentProfile, $workout];
	}

	private function checkinOn(StudentProfile $profile, Workout $workout, string $date): void
	{
		WorkoutCheckin::create([
			'student_profile_id' => $profile->id,
			'workout_id' => $workout->id,
			'performed_at' => $date,
		]);
	}

	public function test_streak_counts_consecutive_days_ending_today(): void
	{
		[, $profile, $workout] = $this->createStudentWithWorkout();

		$this->checkinOn($profile, $workout, Carbon::today()->toDateString());
		$this->checkinOn($profile, $workout, Carbon::today()->subDay()->toDateString());
		$this->checkinOn($profile, $workout, Carbon::today()->subDays(2)->toDateString());

		$this->assertSame(3, $profile->workoutStreak()['current']);
	}

	public function test_streak_survives_a_single_rest_day(): void
	{
		[, $profile, $workout] = $this->createStudentWithWorkout();

		// Treinou hoje e anteontem (1 dia de descanso no meio) — mantém a sequência.
		$this->checkinOn($profile, $workout, Carbon::today()->toDateString());
		$this->checkinOn($profile, $workout, Carbon::today()->subDays(2)->toDateString());

		$this->assertSame(2, $profile->workoutStreak()['current']);
	}

	public function test_streak_breaks_after_two_rest_days(): void
	{
		[, $profile, $workout] = $this->createStudentWithWorkout();

		// Treinou hoje e há 3 dias (2 dias de descanso) — sequência atual reinicia.
		$this->checkinOn($profile, $workout, Carbon::today()->toDateString());
		$this->checkinOn($profile, $workout, Carbon::today()->subDays(3)->toDateString());

		$this->assertSame(1, $profile->workoutStreak()['current']);
	}

	public function test_streak_is_zero_when_last_workout_is_too_old(): void
	{
		[, $profile, $workout] = $this->createStudentWithWorkout();

		$this->checkinOn($profile, $workout, Carbon::today()->subDays(5)->toDateString());

		$streak = $profile->workoutStreak();
		$this->assertSame(0, $streak['current']);
		$this->assertSame(1, $streak['longest']);
	}

	public function test_multiple_checkins_on_the_same_day_count_once(): void
	{
		[, $profile, $workout] = $this->createStudentWithWorkout();

		$today = Carbon::today()->toDateString();
		$this->checkinOn($profile, $workout, $today);
		$this->checkinOn($profile, $workout, $today);

		$this->assertSame(1, $profile->workoutStreak()['current']);
	}

	public function test_rating_level_thresholds(): void
	{
		$this->assertSame('good', DailyCheckin::ratingLevel(10));
		$this->assertSame('good', DailyCheckin::ratingLevel(7));
		$this->assertSame('attention', DailyCheckin::ratingLevel(6));
		$this->assertSame('attention', DailyCheckin::ratingLevel(4));
		$this->assertSame('bad', DailyCheckin::ratingLevel(3));
		$this->assertSame('bad', DailyCheckin::ratingLevel(0));
		$this->assertNull(DailyCheckin::ratingLevel(null));
	}

	public function test_summary_endpoint_returns_streak_sleep_and_week(): void
	{
		[$studentUser, $profile, $workout] = $this->createStudentWithWorkout();

		$this->checkinOn($profile, $workout, Carbon::today()->toDateString());

		DailyCheckin::create([
			'student_profile_id' => $profile->id,
			'date' => Carbon::today()->toDateString(),
			'sleep_rating' => 8,
			'diet_rating' => 6,
		]);

		$response = $this->actingAs($studentUser)->getJson('/api/student/gamification/summary');

		$response->assertStatus(200);
		$response->assertJsonPath('streak.current', 1);
		$response->assertJsonPath('sleep.level', 'good');
		$response->assertJsonCount(7, 'week');
		$response->assertJsonPath('week.6.trained', true);
		$response->assertJsonPath('week.6.sleep_level', 'good');
	}
}
