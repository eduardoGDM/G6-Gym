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

class ExerciseHistoryTest extends TestCase
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
            'rir' => '2',
            'type' => 'Válida',
            'cadence' => '3-0-1',
            'advanced_technique' => 'Drop Set',
        ]);

        return [$studentUser, $workout, $exercise, $workoutExercise];
    }

    private function registerCheckin(User $studentUser, Workout $workout, Exercise $exercise, string $date): void
    {
        $this->actingAs($studentUser)->postJson('/api/student/checkins', [
            'workout_id' => $workout->id,
            'performed_at' => $date,
            'exercises' => [
                [
                    'exercise_id' => $exercise->id,
                    'sets' => [
                        ['set_number' => 1, 'performed_repetitions' => 10, 'performed_weight' => 30],
                    ],
                ],
            ],
        ])->assertCreated();
    }

    public function test_history_returns_only_the_two_newest_executions_with_the_prescription_snapshot(): void
    {
        [$studentUser, $workout, $exercise] = $this->createStudentWithWorkout();

        $oldest = now()->subDays(15)->toDateString();
        $older = now()->subDays(10)->toDateString();
        $newer = now()->subDays(5)->toDateString();

        $this->registerCheckin($studentUser, $workout, $exercise, $oldest);
        $this->registerCheckin($studentUser, $workout, $exercise, $older);
        $this->registerCheckin($studentUser, $workout, $exercise, $newer);

        $response = $this->actingAs($studentUser)
            ->getJson("/api/student/exercises/{$exercise->id}/history");

        $response->assertOk();
        $response->assertJsonPath('exercise.id', $exercise->id);

        $data = $response->json('data');

        // Apenas as 2 execuções mais recentes, da mais nova para a mais antiga.
        $this->assertCount(2, $data);
        $this->assertStringStartsWith($newer, $data[0]['performed_at']);
        $this->assertStringStartsWith($older, $data[1]['performed_at']);

        // O snapshot da prescrição (tipo, RIR, cadência, técnica) vem congelado.
        $set = $data[0]['sets'][0];
        $this->assertSame('Válida', $set['type']);
        $this->assertSame('2', $set['rir']);
        $this->assertSame('3-0-1', $set['cadence']);
        $this->assertSame('Drop Set', $set['advanced_technique']);
        $this->assertSame(10, $set['performed_repetitions']);
        $this->assertSame('30.00', $set['performed_weight']);
    }

    public function test_history_never_returns_other_students_data(): void
    {
        [$studentUser, $workout, $exercise] = $this->createStudentWithWorkout();
        $this->registerCheckin($studentUser, $workout, $exercise, now()->subDays(5)->toDateString());

        [$otherStudent] = $this->createStudentWithWorkout();

        // O outro aluno consulta o mesmo exercício e não vê nenhuma execução.
        $response = $this->actingAs($otherStudent)
            ->getJson("/api/student/exercises/{$exercise->id}/history");

        $response->assertOk();
        $this->assertCount(0, $response->json('data'));
    }

    public function test_history_omits_checkins_without_any_performed_value(): void
    {
        [$studentUser, $workout, $exercise] = $this->createStudentWithWorkout();

        // Check-in sem carga nem repetições realizadas — não deve aparecer no histórico.
        $this->actingAs($studentUser)->postJson('/api/student/checkins', [
            'workout_id' => $workout->id,
            'performed_at' => now()->subDays(3)->toDateString(),
            'exercises' => [
                ['exercise_id' => $exercise->id, 'sets' => []],
            ],
        ])->assertCreated();

        $response = $this->actingAs($studentUser)
            ->getJson("/api/student/exercises/{$exercise->id}/history");

        $response->assertOk();
        $this->assertCount(0, $response->json('data'));
    }
}
