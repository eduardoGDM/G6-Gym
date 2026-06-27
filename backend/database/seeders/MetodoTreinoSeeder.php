<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MetodoTreinoSeeder extends Seeder
{
	public function run(): void
	{
		DB::table('metodos_treino')->insert([
			[
				'nome' => 'Hipertrofia',
				'descricao' => 'Foco em ganho de massa muscular',
				'created_at' => now(),
				'updated_at' => now(),
			],
			[
				'nome' => 'Força',
				'descricao' => 'Foco em aumento de carga máxima',
				'created_at' => now(),
				'updated_at' => now(),
			],
			[
				'nome' => 'Resistência',
				'descricao' => 'Foco em alta repetição e endurance',
				'created_at' => now(),
				'updated_at' => now(),
			],
			[
				'nome' => 'Funcional',
				'descricao' => 'Movimentos naturais e coordenação',
				'created_at' => now(),
				'updated_at' => now(),
			],
			[
				'nome' => 'Emagrecimento',
				'descricao' => 'Foco em gasto calórico',
				'created_at' => now(),
				'updated_at' => now(),
			],
		]);
	}
}
