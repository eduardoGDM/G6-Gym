<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GrupoMuscularSeeder extends Seeder
{
	public function run(): void
	{
		DB::table('grupos_musculares')->insert([
			[
				'nome' => 'Peito',
				'created_at' => now(),
				'updated_at' => now(),
			],
			[
				'nome' => 'Costas',
				'created_at' => now(),
				'updated_at' => now(),
			],
			[
				'nome' => 'Pernas',
				'created_at' => now(),
				'updated_at' => now(),
			],
			[
				'nome' => 'Ombros',
				'created_at' => now(),
				'updated_at' => now(),
			],
			[
				'nome' => 'Bíceps',
				'created_at' => now(),
				'updated_at' => now(),
			],
			[
				'nome' => 'Tríceps',
				'created_at' => now(),
				'updated_at' => now(),
			],
			[
				'nome' => 'Abdômen',
				'created_at' => now(),
				'updated_at' => now(),
			],
		]);
	}
}
