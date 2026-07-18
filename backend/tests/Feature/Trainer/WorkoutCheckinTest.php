<?php

namespace Tests\Feature\Trainer;

use App\Models\Exercise;
use App\Models\MuscleGroup;
use App\Models\StudentProfile;
use App\Models\User;
use App\Models\Workout;
use App\Models\WorkoutCheckin;
use App\Models\WorkoutCheckinExercise;
use App\Models\WorkoutCheckinExerciseSet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkoutCheckinTest extends TestCase
{
    use RefreshDatabase;

    private function createCheckin(User $trainer, string $performedAt = '2026-07-10'): WorkoutCheckin
    {
        $studentUser = User::factory()->create(['role' => 'student']);
        $studentProfile = StudentProfile::create([
            'user_id' => $studentUser->id,
            'cpf' => fake()->unique()->numerify('###########'),
            'phone' => '11999999999',
        ]);

        $muscleGroup = MuscleGroup::create(['name' => 'Peito']);
        $exercise = Exercise::create([
            'muscle_group_id' => $muscleGroup->id,
            'name' => 'Supino reto',
        ]);

        $workout = Workout::create([
            'student_profile_id' => $studentProfile->id,
            'trainer_id' => $trainer->id,
            'name' => 'Treino A',
            'start_date' => now(),
            'active' => true,
        ]);

        $checkin = WorkoutCheckin::create([
            'student_profile_id' => $studentProfile->id,
            'workout_id' => $workout->id,
            'performed_at' => $performedAt,
        ]);

        $checkinExercise = WorkoutCheckinExercise::create([
            'workout_checkin_id' => $checkin->id,
            'exercise_id' => $exercise->id,
        ]);

        WorkoutCheckinExerciseSet::create([
            'workout_checkin_exercise_id' => $checkinExercise->id,
            'set_number' => 1,
            'performed_repetitions' => 10,
            'performed_weight' => 40,
        ]);

        return $checkin;
    }

    public function test_trainer_can_list_checkins_from_their_own_students(): void
    {
        $trainer = User::factory()->create(['role' => 'trainer']);
        $this->createCheckin($trainer);

        $response = $this->actingAs($trainer)->getJson('/api/trainer/checkins');

        $response->assertOk();
        $response->assertJsonCount(1, 'data');
        $response->assertJsonPath('meta.per_page', 10);
    }

    public function test_trainer_does_not_see_checkins_from_other_trainers_students(): void
    {
        $trainerA = User::factory()->create(['role' => 'trainer']);
        $trainerB = User::factory()->create(['role' => 'trainer']);
        $this->createCheckin($trainerA);

        $response = $this->actingAs($trainerB)->getJson('/api/trainer/checkins');

        $response->assertOk();
        $response->assertJsonCount(0, 'data');
    }

    public function test_trainer_can_filter_checkins_by_student(): void
    {
        $trainer = User::factory()->create(['role' => 'trainer']);
        $checkinA = $this->createCheckin($trainer);
        $this->createCheckin($trainer);

        $response = $this->actingAs($trainer)->getJson(
            '/api/trainer/checkins?student_profile_id=' . $checkinA->student_profile_id,
        );

        $response->assertOk();
        $response->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.id', $checkinA->id);
    }

    public function test_trainer_can_filter_checkins_by_date(): void
    {
        $trainer = User::factory()->create(['role' => 'trainer']);
        $checkinA = $this->createCheckin($trainer, '2026-07-10');
        $this->createCheckin($trainer, '2026-07-11');

        $response = $this->actingAs($trainer)->getJson('/api/trainer/checkins?date=2026-07-10');

        $response->assertOk();
        $response->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.id', $checkinA->id);
    }

    public function test_trainer_can_view_details_of_their_own_checkin(): void
    {
        $trainer = User::factory()->create(['role' => 'trainer']);
        $checkin = $this->createCheckin($trainer);

        $response = $this->actingAs($trainer)->getJson("/api/trainer/checkins/{$checkin->id}");

        $response->assertOk();
        $response->assertJsonPath('data.id', $checkin->id);
        $response->assertJsonPath('data.exercises.0.sets.0.performed_repetitions', 10);
        $response->assertJsonPath('data.student_profile.user.id', $checkin->studentProfile->user_id);
        $response->assertJsonPath('data.workout.trainer.id', $trainer->id);
    }

    public function test_trainer_cannot_view_checkin_from_another_trainers_student(): void
    {
        $trainerA = User::factory()->create(['role' => 'trainer']);
        $trainerB = User::factory()->create(['role' => 'trainer']);
        $checkin = $this->createCheckin($trainerA);

        $response = $this->actingAs($trainerB)->getJson("/api/trainer/checkins/{$checkin->id}");

        $response->assertNotFound();
    }

    public function test_students_endpoint_only_returns_trainers_own_students(): void
    {
        $trainerA = User::factory()->create(['role' => 'trainer']);
        $trainerB = User::factory()->create(['role' => 'trainer']);
        $checkinA = $this->createCheckin($trainerA);
        $this->createCheckin($trainerB);

        $response = $this->actingAs($trainerA)->getJson('/api/trainer/checkins/students');

        $response->assertOk();
        $response->assertJsonCount(1);
        $response->assertJsonPath('0.id', $checkinA->student_profile_id);
    }

    public function test_student_role_cannot_access_trainer_checkins_endpoint(): void
    {
        $trainer = User::factory()->create(['role' => 'trainer']);
        $checkin = $this->createCheckin($trainer);

        $response = $this->actingAs($checkin->studentProfile->user)->getJson('/api/trainer/checkins');

        $response->assertForbidden();
    }
}
