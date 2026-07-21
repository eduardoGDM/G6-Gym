<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Índices de performance para colunas usadas em WHERE/ORDER BY que não são
 * chaves estrangeiras (estas já são indexadas automaticamente pelo InnoDB).
 *
 * Os nomes dos índices são explícitos para permitir drop seguro no rollback.
 */
return new class extends Migration
{
	public function up(): void
	{
		// users.role e users.is_active filtram todas as listagens do admin,
		// os contadores do dashboard e a busca de alunos pendentes do trainer.
		Schema::table('users', function (Blueprint $table) {
			$table->index(['role', 'is_active'], 'users_role_is_active_index');
		});

		// workouts é filtrado por trainer_id/student_profile_id combinado com
		// active em praticamente todas as consultas (listagens e dashboards).
		Schema::table('workouts', function (Blueprint $table) {
			$table->index(['trainer_id', 'active'], 'workouts_trainer_active_index');
			$table->index(['student_profile_id', 'active'], 'workouts_student_active_index');
		});

		// exercises é ordenado por nome na listagem do catálogo.
		Schema::table('exercises', function (Blueprint $table) {
			$table->index('name', 'exercises_name_index');
		});

		// Ordenação global por data nos dashboards/recentes do trainer, onde o
		// escopo é por whereHas (workout/studentProfile), não por student_profile_id.
		Schema::table('workout_checkins', function (Blueprint $table) {
			$table->index('performed_at', 'workout_checkins_performed_at_index');
		});

		Schema::table('daily_checkins', function (Blueprint $table) {
			$table->index('date', 'daily_checkins_date_index');
		});
	}

	public function down(): void
	{
		Schema::table('users', function (Blueprint $table) {
			$table->dropIndex('users_role_is_active_index');
		});

		Schema::table('workouts', function (Blueprint $table) {
			$table->dropIndex('workouts_trainer_active_index');
			$table->dropIndex('workouts_student_active_index');
		});

		Schema::table('exercises', function (Blueprint $table) {
			$table->dropIndex('exercises_name_index');
		});

		Schema::table('workout_checkins', function (Blueprint $table) {
			$table->dropIndex('workout_checkins_performed_at_index');
		});

		Schema::table('daily_checkins', function (Blueprint $table) {
			$table->dropIndex('daily_checkins_date_index');
		});
	}
};
