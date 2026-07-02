<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TrainingMethodsSeeder extends Seeder
{
	public function run(): void
	{
		DB::table('training_methods')->insert([
			[
				'name' => 'Hipertrofia',
				'description' => 'Foco em ganho de massa muscular',
				'created_at' => now(),
				'updated_at' => now(),
			],
			[
				'name' => 'Força',
				'description' => 'Foco em aumento de carga máxima',
				'created_at' => now(),
				'updated_at' => now(),
			],
			[
				'name' => 'Resistência',
				'description' => 'Foco em alta repetição e endurance',
				'created_at' => now(),
				'updated_at' => now(),
			],
			[
				'name' => 'Funcional',
				'description' => 'Movimentos naturais e coordenação',
				'created_at' => now(),
				'updated_at' => now(),
			],
			[
				'name' => 'Emagrecimento',
				'description' => 'Foco em gasto calórico',
				'created_at' => now(),
				'updated_at' => now(),
			],
		]);
	}
}
