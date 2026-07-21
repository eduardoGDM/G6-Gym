<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up(): void
	{
		Schema::table('student_profiles', function (Blueprint $table) {
			$table->foreignId('trainer_id')
				->nullable()
				->after('user_id')
				->constrained('users')
				->nullOnDelete();
		});

		// Backfill: vincula alunos já existentes ao trainer do treino mais antigo que possuem,
		// para não perder acesso a alunos cadastrados antes desta migration.
		DB::table('student_profiles')
			->whereNull('trainer_id')
			->get(['id'])
			->each(function ($profile) {
				$trainerId = DB::table('workouts')
					->where('student_profile_id', $profile->id)
					->orderBy('created_at')
					->value('trainer_id');

				if ($trainerId) {
					DB::table('student_profiles')
						->where('id', $profile->id)
						->update(['trainer_id' => $trainerId]);
				}
			});
	}

	public function down(): void
	{
		Schema::table('student_profiles', function (Blueprint $table) {
			$table->dropConstrainedForeignId('trainer_id');
		});
	}
};
