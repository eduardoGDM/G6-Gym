<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	/**
	 * Ajusta as séries do treino ao novo modelo de prescrição:
	 * - repetitions: inteiro -> string (aceita faixa, ex.: "7-12")
	 * - rir: inteiro -> string (aceita "FALHA" além de 0..4)
	 * - type: novo enum obrigatório (default "Válida")
	 * - advanced_technique: novo enum opcional
	 * - planned_repetitions (snapshot do check-in): inteiro -> string
	 *
	 * Compatibilidade: os valores numéricos existentes são convertidos para string
	 * sem perda de dados; as colunas novas recebem o default nas linhas já criadas.
	 */
	public function up(): void
	{
		Schema::table('workout_exercise_series', function (Blueprint $table) {
			$table->string('repetitions', 20)->nullable()->change();
			$table->string('rir', 10)->nullable()->change();

			$table->enum('type', ['Aquecimento', 'Reconhecimento', 'Válida'])
				->default('Válida')
				->after('rir');

			$table->enum('advanced_technique', ['Drop Set', 'Muscle Round', 'Parciais', 'Backoff Set', 'Cluster Set'])
				->nullable()
				->after('type');
		});

		Schema::table('workout_checkin_exercise_sets', function (Blueprint $table) {
			$table->string('planned_repetitions', 20)->nullable()->change();
		});
	}

	public function down(): void
	{
		Schema::table('workout_exercise_series', function (Blueprint $table) {
			$table->dropColumn(['type', 'advanced_technique']);
		});

		Schema::table('workout_exercise_series', function (Blueprint $table) {
			$table->integer('repetitions')->nullable()->change();
			$table->integer('rir')->nullable()->change();
		});

		Schema::table('workout_checkin_exercise_sets', function (Blueprint $table) {
			$table->integer('planned_repetitions')->nullable()->change();
		});
	}
};
