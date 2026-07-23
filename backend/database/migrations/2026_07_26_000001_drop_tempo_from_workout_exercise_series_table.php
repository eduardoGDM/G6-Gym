<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Remove a coluna `tempo` de workout_exercise_series. `tempo` e `cadence`
 * descreviam o mesmo conceito (ritmo de execução), gerando redundância. A
 * aplicação passa a usar apenas `cadence`.
 *
 * Antes de dropar, preserva qualquer ritmo cadastrado só em `tempo`: onde
 * `cadence` está vazio e `tempo` tem valor, copia o valor para `cadence`.
 */
return new class extends Migration
{
	public function up(): void
	{
		if (! Schema::hasColumn('workout_exercise_series', 'tempo')) {
			return;
		}

		DB::table('workout_exercise_series')
			->whereNotNull('tempo')
			->where('tempo', '!=', '')
			->where(function ($query) {
				$query->whereNull('cadence')->orWhere('cadence', '');
			})
			->update(['cadence' => DB::raw('tempo')]);

		Schema::table('workout_exercise_series', function (Blueprint $table) {
			$table->dropColumn('tempo');
		});
	}

	public function down(): void
	{
		Schema::table('workout_exercise_series', function (Blueprint $table) {
			$table->string('tempo')->nullable()->after('advanced_technique');
		});
	}
};
