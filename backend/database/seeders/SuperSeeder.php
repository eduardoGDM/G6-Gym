<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

use App\Models\User;
use App\Models\MuscleGroup;
use App\Models\Exercise;
use App\Models\StudentProfile;
use App\Models\Workout;
use App\Models\WorkoutExercise;
use App\Models\WorkoutExerciseSeries;

class SuperSeeder extends Seeder
{
	public function run(): void
	{
		// ======================
		// USERS
		// ======================

		$trainer = User::create([
			'name' => 'Personal Teste',
			'email' => 'trainer@teste.com',
			'password' => Hash::make('123456'),
			'role' => 'trainer',
		]);

		$student = User::create([
			'name' => 'Aluno Teste',
			'email' => 'student@teste.com',
			'password' => Hash::make('123456'),
			'role' => 'student',
		]);

		// ======================
		// STUDENT PROFILE
		// ======================

		$studentProfile = StudentProfile::create([
			'user_id' => $student->id,
			'cpf' => '123.456.789-00',
			'phone' => '41999999999',
			'birth_date' => '2000-01-01',
			'gender' => 'Masculino',
			'height' => 1.80,
			'photo' => null,
			'observations' => 'Aluno de teste',
		]);

		// ======================
		// MUSCLE GROUPS
		// ======================

		$chest = MuscleGroup::create([
			'name' => 'Peito',
		]);

		$legs = MuscleGroup::create([
			'name' => 'Pernas',
		]);

		// ======================
		// EXERCISES
		// ======================

		$benchPress = Exercise::create([
			'muscle_group_id' => $chest->id,
			'name' => 'Supino Reto',
			'description' => 'Exercício de peitoral',
			'equipment' => 'Barra',
			'video_url' => null,
		]);

		$squat = Exercise::create([
			'muscle_group_id' => $legs->id,
			'name' => 'Agachamento Livre',
			'description' => 'Exercício de pernas',
			'equipment' => 'Barra',
			'video_url' => null,
		]);

		// ======================
		// WORKOUT
		// ======================

		$workout = Workout::create([
			'student_profile_id' => $studentProfile->id,
			'trainer_id' => $trainer->id,
			'name' => 'Treino A',
			'description' => 'Treino de força iniciante',
			'start_date' => now(),
			'end_date' => null,
			'active' => true,
		]);

		// ======================
		// WORKOUT EXERCISES
		// ======================

		$benchPressExercise = WorkoutExercise::create([
			'workout_id' => $workout->id,
			'exercise_id' => $benchPress->id,
			'order' => 1,
			'notes' => 'Foco em execução perfeita',
		]);

		WorkoutExerciseSeries::create([
			'workout_exercise_id' => $benchPressExercise->id,
			'order' => 1,
			'repetitions' => '12-15',
			'weight' => 40,
			'rest_time' => 60,
			'rir' => '3',
			'type' => 'Aquecimento',
			'cadence' => '2s exc / 1s conc',
			'notes' => 'Aquecimento',
		]);

		WorkoutExerciseSeries::create([
			'workout_exercise_id' => $benchPressExercise->id,
			'order' => 2,
			'repetitions' => '10',
			'weight' => 40,
			'rest_time' => 60,
			'rir' => '2',
			'type' => 'Válida',
			'cadence' => '2s exc / 1s conc',
		]);

		WorkoutExerciseSeries::create([
			'workout_exercise_id' => $benchPressExercise->id,
			'order' => 3,
			'repetitions' => '8-10',
			'weight' => 40,
			'rest_time' => 60,
			'rir' => 'FALHA',
			'type' => 'Válida',
			'cadence' => '2s exc / 1s conc',
			'notes' => 'Última série até a falha',
		]);

		$squatExercise = WorkoutExercise::create([
			'workout_id' => $workout->id,
			'exercise_id' => $squat->id,
			'order' => 2,
			'notes' => 'Controle de profundidade',
		]);

		WorkoutExerciseSeries::create([
			'workout_exercise_id' => $squatExercise->id,
			'order' => 1,
			'repetitions' => '10',
			'weight' => 60,
			'rest_time' => 90,
			'rir' => '2',
			'type' => 'Reconhecimento',
			'cadence' => '3s excêntrica',
		]);

		WorkoutExerciseSeries::create([
			'workout_exercise_id' => $squatExercise->id,
			'order' => 2,
			'repetitions' => '8',
			'weight' => 60,
			'rest_time' => 90,
			'rir' => '1',
			'type' => 'Válida',
			'cadence' => '3s excêntrica',
		]);

		WorkoutExerciseSeries::create([
			'workout_exercise_id' => $squatExercise->id,
			'order' => 3,
			'repetitions' => '8',
			'weight' => 65,
			'rest_time' => 90,
			'rir' => '0',
			'type' => 'Válida',
			'advanced_technique' => 'Drop Set',
			'cadence' => '3s excêntrica',
			'notes' => 'Drop set na última série',
		]);

		WorkoutExerciseSeries::create([
			'workout_exercise_id' => $squatExercise->id,
			'order' => 4,
			'repetitions' => '6',
			'weight' => 65,
			'rest_time' => 90,
			'rir' => 'FALHA',
			'type' => 'Válida',
			'cadence' => '3s excêntrica',
		]);
	}
}
