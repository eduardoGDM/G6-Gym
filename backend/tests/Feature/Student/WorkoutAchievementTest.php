<?php

namespace Tests\Feature\Student;

use App\Models\Exercise;
use App\Models\MuscleGroup;
use App\Models\StudentProfile;
use App\Models\User;
use App\Models\Workout;
use App\Models\WorkoutExercise;
use App\Models\WorkoutExerciseSeries;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkoutAchievementTest extends TestCase
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
            'type' => 'Válida',
        ]);

        return [$studentUser, $workout, $exercise];
    }

    /**
     * Registra um check-in de uma série (carga/reps informadas) e devolve o id.
     */
    private function registerCheckin(
        User $studentUser,
        Workout $workout,
        Exercise $exercise,
        string $date,
        float $weight,
        int $reps
    ): int {
        $response = $this->actingAs($studentUser)->postJson('/api/student/checkins', [
            'workout_id' => $workout->id,
            'performed_at' => $date,
            'exercises' => [
                [
                    'exercise_id' => $exercise->id,
                    'sets' => [
                        ['set_number' => 1, 'performed_repetitions' => $reps, 'performed_weight' => $weight],
                    ],
                ],
            ],
        ])->assertCreated();

        return $response->json('data.id');
    }

    public function test_detects_a_weight_record_against_the_previous_execution(): void
    {
        [$studentUser, $workout, $exercise] = $this->createStudentWithWorkout();

        $this->registerCheckin($studentUser, $workout, $exercise, now()->subDays(5)->toDateString(), 80, 10);
        $current = $this->registerCheckin($studentUser, $workout, $exercise, now()->toDateString(), 85, 10);

        $response = $this->actingAs($studentUser)
            ->getJson("/api/student/checkins/{$current}/achievements")
            ->assertOk();

        $data = $response->json('data');

        $this->assertCount(1, $data);
        $this->assertSame('personal_record', $data[0]['type']);
        $this->assertSame($exercise->id, $data[0]['exercise']['id']);

        $improvement = $data[0]['improvements'][0];
        $this->assertSame('weight', $improvement['metric']);
        $this->assertEquals(80, $improvement['previous']);
        $this->assertEquals(85, $improvement['current']);
        $this->assertEquals(5, $improvement['delta']);
        $this->assertSame('kg', $improvement['unit']);
    }

    public function test_detects_more_reps_with_the_same_weight(): void
    {
        [$studentUser, $workout, $exercise] = $this->createStudentWithWorkout();

        $this->registerCheckin($studentUser, $workout, $exercise, now()->subDays(5)->toDateString(), 50, 10);
        $current = $this->registerCheckin($studentUser, $workout, $exercise, now()->toDateString(), 50, 12);

        $improvement = $this->actingAs($studentUser)
            ->getJson("/api/student/checkins/{$current}/achievements")
            ->assertOk()
            ->json('data.0.improvements.0');

        $this->assertSame('reps', $improvement['metric']);
        $this->assertEquals(10, $improvement['previous']);
        $this->assertEquals(12, $improvement['current']);
        $this->assertEquals(2, $improvement['delta']);
    }

    public function test_detects_a_volume_record_even_when_weight_dropped(): void
    {
        [$studentUser, $workout, $exercise] = $this->createStudentWithWorkout();

        // Carga menor (35 < 40) mas volume maior: 35×12 = 420 > 40×10 = 400.
        $this->registerCheckin($studentUser, $workout, $exercise, now()->subDays(5)->toDateString(), 40, 10);
        $current = $this->registerCheckin($studentUser, $workout, $exercise, now()->toDateString(), 35, 12);

        $improvement = $this->actingAs($studentUser)
            ->getJson("/api/student/checkins/{$current}/achievements")
            ->assertOk()
            ->json('data.0.improvements.0');

        $this->assertSame('volume', $improvement['metric']);
        $this->assertEquals(400, $improvement['previous']);
        $this->assertEquals(420, $improvement['current']);
        $this->assertEquals(20, $improvement['delta']);
    }

    public function test_no_record_when_performance_did_not_improve(): void
    {
        [$studentUser, $workout, $exercise] = $this->createStudentWithWorkout();

        $this->registerCheckin($studentUser, $workout, $exercise, now()->subDays(5)->toDateString(), 50, 10);
        $current = $this->registerCheckin($studentUser, $workout, $exercise, now()->toDateString(), 50, 10);

        $data = $this->actingAs($studentUser)
            ->getJson("/api/student/checkins/{$current}/achievements")
            ->assertOk()
            ->json('data');

        $this->assertCount(0, $data);
    }

    public function test_first_execution_of_an_exercise_is_never_a_record(): void
    {
        [$studentUser, $workout, $exercise] = $this->createStudentWithWorkout();

        $current = $this->registerCheckin($studentUser, $workout, $exercise, now()->toDateString(), 90, 15);

        $data = $this->actingAs($studentUser)
            ->getJson("/api/student/checkins/{$current}/achievements")
            ->assertOk()
            ->json('data');

        $this->assertCount(0, $data);
    }

    public function test_a_student_cannot_read_another_students_checkin_achievements(): void
    {
        [$studentUser, $workout, $exercise] = $this->createStudentWithWorkout();
        $current = $this->registerCheckin($studentUser, $workout, $exercise, now()->toDateString(), 80, 10);

        [$otherStudent] = $this->createStudentWithWorkout();

        $this->actingAs($otherStudent)
            ->getJson("/api/student/checkins/{$current}/achievements")
            ->assertNotFound();
    }
}
