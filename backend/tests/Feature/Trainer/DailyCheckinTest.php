<?php

namespace Tests\Feature\Trainer;

use App\Models\DailyCheckin;
use App\Models\StudentProfile;
use App\Models\User;
use App\Models\Workout;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DailyCheckinTest extends TestCase
{
    use RefreshDatabase;

    private function createCheckin(User $trainer, string $date = '2026-07-10', ?string $studentName = null): DailyCheckin
    {
        $studentUser = User::factory()->create([
            'role' => 'student',
            'name' => $studentName ?? fake()->name(),
        ]);
        $studentProfile = StudentProfile::create([
            'user_id' => $studentUser->id,
            'cpf' => fake()->unique()->numerify('###########'),
            'phone' => '11999999999',
        ]);

        Workout::create([
            'student_profile_id' => $studentProfile->id,
            'trainer_id' => $trainer->id,
            'name' => 'Treino A',
            'start_date' => now(),
            'active' => true,
        ]);

        return DailyCheckin::create([
            'student_profile_id' => $studentProfile->id,
            'date' => $date,
            'sleep_rating' => 8,
            'sleep_notes' => 'Dormi bem',
            'diet_rating' => 7,
            'diet_notes' => 'Comi certinho',
        ]);
    }

    public function test_trainer_can_list_daily_checkins_from_their_own_students(): void
    {
        $trainer = User::factory()->create(['role' => 'trainer']);
        $checkin = $this->createCheckin($trainer);

        $response = $this->actingAs($trainer)->getJson('/api/trainer/daily-checkins');

        $response->assertOk();
        $response->assertJsonCount(1, 'data');
        $response->assertJsonPath('meta.per_page', 10);
        $response->assertJsonPath('data.0.student_profile.user.id', $checkin->studentProfile->user_id);
    }

    public function test_trainer_does_not_see_daily_checkins_from_other_trainers_students(): void
    {
        $trainerA = User::factory()->create(['role' => 'trainer']);
        $trainerB = User::factory()->create(['role' => 'trainer']);
        $this->createCheckin($trainerA);

        $response = $this->actingAs($trainerB)->getJson('/api/trainer/daily-checkins');

        $response->assertOk();
        $response->assertJsonCount(0, 'data');
    }

    public function test_trainer_can_filter_daily_checkins_by_student_name(): void
    {
        $trainer = User::factory()->create(['role' => 'trainer']);
        $checkinA = $this->createCheckin($trainer, '2026-07-10', 'Maria Silva');
        $this->createCheckin($trainer, '2026-07-10', 'João Souza');

        $response = $this->actingAs($trainer)->getJson('/api/trainer/daily-checkins?student=Maria');

        $response->assertOk();
        $response->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.id', $checkinA->id);
    }

    public function test_trainer_can_filter_daily_checkins_by_date_range(): void
    {
        $trainer = User::factory()->create(['role' => 'trainer']);
        $checkinA = $this->createCheckin($trainer, '2026-07-10');
        $this->createCheckin($trainer, '2026-07-20');

        $response = $this->actingAs($trainer)->getJson(
            '/api/trainer/daily-checkins?date_from=2026-07-01&date_to=2026-07-15',
        );

        $response->assertOk();
        $response->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.id', $checkinA->id);
    }

    public function test_daily_checkins_are_ordered_by_date_desc_then_created_at_desc(): void
    {
        $trainer = User::factory()->create(['role' => 'trainer']);
        $older = $this->createCheckin($trainer, '2026-07-10');
        $newer = $this->createCheckin($trainer, '2026-07-15');

        $response = $this->actingAs($trainer)->getJson('/api/trainer/daily-checkins');

        $response->assertOk();
        $response->assertJsonPath('data.0.id', $newer->id);
        $response->assertJsonPath('data.1.id', $older->id);
    }

    public function test_trainer_can_view_details_of_their_own_daily_checkin(): void
    {
        $trainer = User::factory()->create(['role' => 'trainer']);
        $checkin = $this->createCheckin($trainer);

        $response = $this->actingAs($trainer)->getJson("/api/trainer/daily-checkins/{$checkin->id}");

        $response->assertOk();
        $response->assertJsonPath('data.id', $checkin->id);
        $response->assertJsonPath('data.sleep_notes', 'Dormi bem');
        $response->assertJsonPath('data.diet_notes', 'Comi certinho');
        $response->assertJsonPath('data.student_profile.user.id', $checkin->studentProfile->user_id);
    }

    public function test_trainer_cannot_view_daily_checkin_from_another_trainers_student(): void
    {
        $trainerA = User::factory()->create(['role' => 'trainer']);
        $trainerB = User::factory()->create(['role' => 'trainer']);
        $checkin = $this->createCheckin($trainerA);

        $response = $this->actingAs($trainerB)->getJson("/api/trainer/daily-checkins/{$checkin->id}");

        $response->assertNotFound();
    }

    public function test_student_role_cannot_access_trainer_daily_checkins_endpoint(): void
    {
        $trainer = User::factory()->create(['role' => 'trainer']);
        $checkin = $this->createCheckin($trainer);

        $response = $this->actingAs($checkin->studentProfile->user)->getJson('/api/trainer/daily-checkins');

        $response->assertForbidden();
    }
}
