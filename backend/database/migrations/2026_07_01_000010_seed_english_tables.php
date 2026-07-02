<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
	public function up(): void
	{
		// Seed muscle groups
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

		// Seed training methods
		DB::table('training_methods')->insert([
			[
				'name' => 'Hipertrofia',
				'created_at' => now(),
				'updated_at' => now(),
			],
			[
				'name' => 'Força',
				'created_at' => now(),
				'updated_at' => now(),
			],
			[
				'name' => 'Resistência',
				'created_at' => now(),
				'updated_at' => now(),
			],
			[
				'name' => 'Funcional',
				'created_at' => now(),
				'updated_at' => now(),
			],
			[
				'name' => 'Emagrecimento',
				'created_at' => now(),
				'updated_at' => now(),
			],
		]);
	}

	public function down(): void
	{
		DB::table('muscle_groups')->truncate();
		DB::table('training_methods')->truncate();
	}
};
