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
			'current_weight' => 80.5,
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

		WorkoutExercise::create([
			'workout_id' => $workout->id,
			'exercise_id' => $benchPress->id,
			'training_method_id' => null,
			'order' => 1,
			'warm_up_sets' => 2,
			'recognition_sets' => 1,
			'valid_sets' => 3,
			'reps' => '10-12',
			'rir' => 2,
			'rest_seconds' => 60,
			'cadence' => '2-1-2',
			'load' => 40,
			'observations' => 'Foco em execução perfeita',
		]);

		WorkoutExercise::create([
			'workout_id' => $workout->id,
			'exercise_id' => $squat->id,
			'training_method_id' => null,
			'order' => 2,
			'warm_up_sets' => 2,
			'recognition_sets' => 1,
			'valid_sets' => 4,
			'reps' => '8-10',
			'rir' => 1,
			'rest_seconds' => 90,
			'cadence' => '3-1-1',
			'load' => 60,
			'observations' => 'Controle de profundidade',
		]);
	}
}
