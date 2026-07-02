<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MuscleGroupSeeder extends Seeder
{
	public function run(): void
	{
		DB::table('muscle_groups')->insert([
			[
				'name' => 'Peito',
				'created_at' => now(),
				'updated_at' => now(),
			],
			[
				'name' => 'Costas',
				'created_at' => now(),
				'updated_at' => now(),
			],
			[
				'name' => 'Pernas',
				'created_at' => now(),
				'updated_at' => now(),
			],
			[
				'name' => 'Ombros',
				'created_at' => now(),
				'updated_at' => now(),
			],
			[
				'name' => 'Bíceps',
				'created_at' => now(),
				'updated_at' => now(),
			],
			[
				'name' => 'Tríceps',
				'created_at' => now(),
				'updated_at' => now(),
			],
			[
				'name' => 'Abdômen',
				'created_at' => now(),
				'updated_at' => now(),
			],
		]);
	}
}
