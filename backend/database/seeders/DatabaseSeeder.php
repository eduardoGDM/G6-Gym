<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
	use WithoutModelEvents;

	/**
	 * Seed the application's database.
	 */
	public function run(): void
	{
		// Usuários base: admin, personal e aluno (aluno vinculado ao personal).
		$this->call(UsersSeeder::class);

		// Exercícios e dados de apoio.
		$this->call(MuscleGroupSeeder::class);
		$this->call(TrainingMethodsSeeder::class);
		$this->call(ExerciseSeeder::class);
	}
}
