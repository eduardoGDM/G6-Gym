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

class WorkoutCheckinTest extends TestCase
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

        $seriesData = [
            ['order' => 1, 'repetitions' => 12, 'weight' => 40, 'rest_time' => 60],
            ['order' => 2, 'repetitions' => 10, 'weight' => 45, 'rest_time' => 60],
            ['order' => 3, 'repetitions' => 8, 'weight' => 50, 'rest_time' => 90],
        ];

        foreach ($seriesData as $data) {
            WorkoutExerciseSeries::create(array_merge(
                ['workout_exercise_id' => $workoutExercise->id],
                $data,
            ));
        }

        return [$studentUser, $workout, $exercise, $workoutExercise];
    }

    public function test_checkin_creation_mirrors_prescribed_series_as_a_snapshot(): void
    {
        [$studentUser, $workout, $exercise] = $this->createStudentWithWorkout();

        $response = $this->actingAs($studentUser)->postJson('/api/student/checkins', [
            'workout_id' => $workout->id,
            'performed_at' => now()->toDateString(),
            'notes' => 'Treino puxado hoje',
            'exercises' => [
                [
                    'exercise_id' => $exercise->id,
                    'notes' => 'Ombro incomodou um pouco',
                    'sets' => [
                        ['set_number' => 1, 'performed_repetitions' => 12, 'performed_weight' => 40],
                        ['set_number' => 2, 'performed_repetitions' => 9, 'performed_weight' => 45, 'notes' => 'Falha muscular'],
                        // set 3 left blank on purpose to prove it still gets created from the prescription
                    ],
                ],
            ],
        ]);

        $response->assertCreated();

        $sets = $response->json('data.exercises.0.sets');

        $this->assertCount(3, $sets, 'a execução deve espelhar as 3 séries prescritas, mesmo que uma não tenha sido preenchida');

        $this->assertSame('12', $sets[0]['planned_repetitions']);
        $this->assertSame('40.00', $sets[0]['planned_weight']);
        $this->assertSame(12, $sets[0]['performed_repetitions']);

        $this->assertSame(9, $sets[1]['performed_repetitions']);
        $this->assertSame('Falha muscular', $sets[1]['notes']);

        $this->assertSame('8', $sets[2]['planned_repetitions']);
        $this->assertNull($sets[2]['performed_repetitions']);
    }

    public function test_updating_a_checkin_keeps_the_original_planned_snapshot_even_if_the_prescription_changes_later(): void
    {
        [$studentUser, $workout, $exercise, $workoutExercise] = $this->createStudentWithWorkout();

        $created = $this->actingAs($studentUser)->postJson('/api/student/checkins', [
            'workout_id' => $workout->id,
            'performed_at' => now()->toDateString(),
            'exercises' => [
                [
                    'exercise_id' => $exercise->id,
                    'sets' => [
                        ['set_number' => 1, 'performed_repetitions' => 12, 'performed_weight' => 40],
                    ],
                ],
            ],
        ])->json('data');

        // O personal altera a prescrição depois do check-in já ter sido registrado.
        $workoutExercise->series()->where('order', 1)->update(['repetitions' => 20, 'weight' => 999]);

        $response = $this->actingAs($studentUser)->putJson("/api/student/checkins/{$created['id']}", [
            'exercises' => [
                [
                    'exercise_id' => $exercise->id,
                    'sets' => [
                        ['set_number' => 1, 'performed_repetitions' => 13, 'performed_weight' => 41, 'notes' => 'Ajustado'],
                    ],
                ],
            ],
        ]);

        $response->assertOk();

        $set = $response->json('data.exercises.0.sets.0');

        $this->assertSame(13, $set['performed_repetitions']);
        $this->assertSame('41.00', $set['performed_weight']);
        $this->assertSame('Ajustado', $set['notes']);

        // O snapshot original (planejado) não deve mudar mesmo com a prescrição alterada depois.
        $this->assertSame('12', $set['planned_repetitions']);
        $this->assertSame('40.00', $set['planned_weight']);
    }

    public function test_history_detail_returns_the_saved_set_snapshot(): void
    {
        [$studentUser, $workout, $exercise] = $this->createStudentWithWorkout();

        $created = $this->actingAs($studentUser)->postJson('/api/student/checkins', [
            'workout_id' => $workout->id,
            'performed_at' => now()->toDateString(),
            'exercises' => [
                [
                    'exercise_id' => $exercise->id,
                    'sets' => [
                        ['set_number' => 1, 'performed_repetitions' => 12, 'performed_weight' => 40],
                    ],
                ],
            ],
        ])->json('data');

        $response = $this->actingAs($studentUser)->getJson("/api/student/checkins/{$created['id']}");

        $response->assertOk();
        $response->assertJsonPath('data.exercises.0.sets.0.performed_repetitions', 12);
        $response->assertJsonPath('data.exercises.0.sets.0.set_number', 1);
    }

    public function test_student_can_register_more_than_one_checkin_on_the_same_date(): void
    {
        [$studentUser, $workout, $exercise] = $this->createStudentWithWorkout();

        $payload = [
            'workout_id' => $workout->id,
            'performed_at' => now()->toDateString(),
            'exercises' => [
                [
                    'exercise_id' => $exercise->id,
                    'sets' => [
                        ['set_number' => 1, 'performed_repetitions' => 12, 'performed_weight' => 40],
                    ],
                ],
            ],
        ];

        $this->actingAs($studentUser)->postJson('/api/student/checkins', $payload)->assertCreated();
        $second = $this->actingAs($studentUser)->postJson('/api/student/checkins', $payload);

        $second->assertCreated();

        $this->assertSame(
            2,
            \App\Models\WorkoutCheckin::where('student_profile_id', $workout->student_profile_id)->count(),
        );
    }

    public function test_student_can_delete_own_checkin_along_with_its_exercises_and_sets(): void
    {
        [$studentUser, $workout, $exercise] = $this->createStudentWithWorkout();

        $created = $this->actingAs($studentUser)->postJson('/api/student/checkins', [
            'workout_id' => $workout->id,
            'performed_at' => now()->toDateString(),
            'exercises' => [
                [
                    'exercise_id' => $exercise->id,
                    'sets' => [
                        ['set_number' => 1, 'performed_repetitions' => 12, 'performed_weight' => 40],
                    ],
                ],
            ],
        ])->json('data');

        $checkinExerciseId = $created['exercises'][0]['id'];

        $response = $this->actingAs($studentUser)->deleteJson("/api/student/checkins/{$created['id']}");

        $response->assertOk();
        $response->assertJsonPath('message', 'Check-in removido com sucesso');

        $this->assertDatabaseMissing('workout_checkins', ['id' => $created['id']]);

        // Exclusão definitiva: o cascadeOnDelete das migrations tem que levar
        // exercícios e séries junto, senão sobram órfãos no histórico.
        $this->assertDatabaseMissing('workout_checkin_exercises', ['workout_checkin_id' => $created['id']]);
        $this->assertDatabaseMissing('workout_checkin_exercise_sets', ['workout_checkin_exercise_id' => $checkinExerciseId]);
    }

    public function test_student_cannot_delete_a_checkin_from_another_student(): void
    {
        [$studentUser, $workout, $exercise] = $this->createStudentWithWorkout();

        $created = $this->actingAs($studentUser)->postJson('/api/student/checkins', [
            'workout_id' => $workout->id,
            'performed_at' => now()->toDateString(),
            'exercises' => [
                [
                    'exercise_id' => $exercise->id,
                    'sets' => [
                        ['set_number' => 1, 'performed_repetitions' => 12, 'performed_weight' => 40],
                    ],
                ],
            ],
        ])->json('data');

        [$otherStudentUser] = $this->createStudentWithWorkout();

        $response = $this->actingAs($otherStudentUser)->deleteJson("/api/student/checkins/{$created['id']}");

        $response->assertNotFound();

        $this->assertDatabaseHas('workout_checkins', ['id' => $created['id']]);
    }
}
