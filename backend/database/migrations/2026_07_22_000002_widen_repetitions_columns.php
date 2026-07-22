<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	/**
	 * Amplia as colunas de repetições para comportar o formato "por série"
	 * (ex.: "6x6x6x6x6x6"), que pode ultrapassar os 20 caracteres anteriores.
	 *
	 * Compatibilidade: apenas aumenta o limite da string; nenhum dado existente
	 * é alterado ou perdido.
	 */
	public function up(): void
	{
		Schema::table('workout_exercise_series', function (Blueprint $table) {
			$table->string('repetitions', 50)->nullable()->change();
		});

		Schema::table('workout_checkin_exercise_sets', function (Blueprint $table) {
			$table->string('planned_repetitions', 50)->nullable()->change();
		});
	}

	public function down(): void
	{
		Schema::table('workout_exercise_series', function (Blueprint $table) {
			$table->string('repetitions', 20)->nullable()->change();
		});

		Schema::table('workout_checkin_exercise_sets', function (Blueprint $table) {
			$table->string('planned_repetitions', 20)->nullable()->change();
		});
	}
};
