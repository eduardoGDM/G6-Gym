<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	/**
	 * A autogestão de treinos deixa de ser exceção: todo aluno passa a poder
	 * ajustar os próprios treinos por padrão. O personal continua podendo
	 * revogar aluno por aluno (student-profiles/{id}/workout-management), então
	 * o backfill vale apenas para a base já cadastrada.
	 */
	public function up(): void
	{
		Schema::table('student_profiles', function (Blueprint $table) {
			$table->boolean('can_manage_workouts')->default(true)->change();
		});

		DB::table('student_profiles')
			->where('can_manage_workouts', false)
			->update(['can_manage_workouts' => true]);
	}

	/**
	 * Volta o default para false, mas não revoga quem já recebeu a permissão:
	 * não há como distinguir o aluno liberado pelo backfill do aluno liberado
	 * manualmente pelo personal antes dele.
	 */
	public function down(): void
	{
		Schema::table('student_profiles', function (Blueprint $table) {
			$table->boolean('can_manage_workouts')->default(false)->change();
		});
	}
};
