<?php

namespace Tests\Feature\Trainer;

use App\Models\Exercise;
use App\Models\MuscleGroup;
use App\Models\StudentProfile;
use App\Models\User;
use App\Models\Workout;
use App\Models\WorkoutExercise;
use App\Models\WorkoutExerciseSeries;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentWorkoutSheetTest extends TestCase
{
    use RefreshDatabase;

    private function createStudentWithWorkout(User $trainer, bool $active = true): StudentProfile
    {
        $studentUser = User::factory()->create(['role' => 'student']);
        $studentProfile = StudentProfile::create([
            'user_id' => $studentUser->id,
            'trainer_id' => $trainer->id,
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
            'active' => $active,
        ]);
        $workout->muscleGroups()->sync([$muscleGroup->id]);

        $workoutExercise = WorkoutExercise::create([
            'workout_id' => $workout->id,
            'exercise_id' => $exercise->id,
            'order' => 1,
        ]);

        WorkoutExerciseSeries::create([
            'workout_exercise_id' => $workoutExercise->id,
            'order' => 1,
            'repetitions' => 12,
            'weight' => 40,
            'rest_time' => 60,
        ]);

        return $studentProfile;
    }

    public function test_trainer_can_generate_pdf_for_their_own_student(): void
    {
        $trainer = User::factory()->create(['role' => 'trainer']);
        $studentProfile = $this->createStudentWithWorkout($trainer);

        $response = $this->actingAs($trainer)
            ->get("/api/trainer/students/{$studentProfile->id}/workout-sheet");

        $response->assertOk();
        $response->assertHeader('content-type', 'application/pdf');
    }

    public function test_inactive_workouts_are_not_included_and_still_return_pdf(): void
    {
        $trainer = User::factory()->create(['role' => 'trainer']);
        $studentProfile = $this->createStudentWithWorkout($trainer, active: false);

        $response = $this->actingAs($trainer)
            ->get("/api/trainer/students/{$studentProfile->id}/workout-sheet");

        $response->assertOk();
        $response->assertHeader('content-type', 'application/pdf');
    }

    public function test_trainer_cannot_generate_pdf_for_a_student_not_linked_to_them(): void
    {
        $trainerA = User::factory()->create(['role' => 'trainer']);
        $trainerB = User::factory()->create(['role' => 'trainer']);
        $studentProfile = $this->createStudentWithWorkout($trainerA);

        $response = $this->actingAs($trainerB)
            ->get("/api/trainer/students/{$studentProfile->id}/workout-sheet");

        $response->assertForbidden();
    }

    public function test_returns_404_for_nonexistent_student(): void
    {
        $trainer = User::factory()->create(['role' => 'trainer']);

        $response = $this->actingAs($trainer)
            ->get('/api/trainer/students/99999/workout-sheet');

        $response->assertNotFound();
    }

    public function test_student_role_cannot_access_trainer_endpoint(): void
    {
        $trainer = User::factory()->create(['role' => 'trainer']);
        $studentProfile = $this->createStudentWithWorkout($trainer);
        $studentUser = $studentProfile->user;

        $response = $this->actingAs($studentUser)
            ->get("/api/trainer/students/{$studentProfile->id}/workout-sheet");

        $response->assertForbidden();
    }

    public function test_guest_cannot_access_the_endpoint(): void
    {
        $trainer = User::factory()->create(['role' => 'trainer']);
        $studentProfile = $this->createStudentWithWorkout($trainer);

        $response = $this->get("/api/trainer/students/{$studentProfile->id}/workout-sheet");

        $response->assertUnauthorized();
    }
}
