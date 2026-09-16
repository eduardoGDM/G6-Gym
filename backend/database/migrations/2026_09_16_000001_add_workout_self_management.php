<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up(): void
	{
		// Permissão concedida pelo personal para o aluno montar os próprios treinos.
		Schema::table('student_profiles', function (Blueprint $table) {
			$table->boolean('can_manage_workouts')
				->default(false)
				->after('trainer_id');
		});

		// Autor do treino: o aluno só pode alterar os treinos que ele mesmo criou.
		Schema::table('workouts', function (Blueprint $table) {
			$table->foreignId('created_by')
				->nullable()
				->after('trainer_id')
				->constrained('users')
				->nullOnDelete();
		});

		// Backfill: até aqui só o personal criava treinos.
		DB::table('workouts')
			->whereNull('created_by')
			->update(['created_by' => DB::raw('trainer_id')]);
	}

	public function down(): void
	{
		Schema::table('workouts', function (Blueprint $table) {
			$table->dropConstrainedForeignId('created_by');
		});

		Schema::table('student_profiles', function (Blueprint $table) {
			$table->dropColumn('can_manage_workouts');
		});
	}
};
