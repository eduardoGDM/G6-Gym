<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	/**
	 * Marca o momento em que o aluno finalizou o treino.
	 *
	 * O check-in nasce no primeiro toque da tela (autosave), então até aqui não
	 * havia como distinguir um treino abandonado no meio de um treino
	 * finalizado. Nulo = em andamento.
	 */
	public function up(): void
	{
		Schema::table('workout_checkins', function (Blueprint $table) {
			$table->timestamp('completed_at')->nullable()->after('performed_at');
		});

		// Base existente é tratada como concluída: sem o marcador, todo
		// check-in antigo apareceria como pendente para o aluno.
		DB::table('workout_checkins')
			->whereNull('completed_at')
			->update(['completed_at' => DB::raw('updated_at')]);
	}

	public function down(): void
	{
		Schema::table('workout_checkins', function (Blueprint $table) {
			$table->dropColumn('completed_at');
		});
	}
};
