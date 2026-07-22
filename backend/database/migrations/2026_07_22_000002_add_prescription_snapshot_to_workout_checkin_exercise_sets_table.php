<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	/**
	 * Estende o snapshot do check-in (workout_checkin_exercise_sets) para também
	 * congelar a prescrição não-numérica da série no momento da execução:
	 * tipo, RIR, cadência e técnica avançada. Esses campos vivem apenas em
	 * workout_exercise_series (prescrição), então sem o snapshot o histórico do
	 * aluno ficaria refém de edições futuras do treino.
	 *
	 * São strings tolerantes (não enums): o snapshot preserva o valor exibido no
	 * dia, mesmo que os enums da prescrição mudem depois.
	 */
	public function up(): void
	{
		Schema::table('workout_checkin_exercise_sets', function (Blueprint $table) {
			$table->string('planned_type', 30)->nullable()->after('set_number');
			$table->string('planned_rir', 10)->nullable()->after('performed_repetitions');
			$table->string('planned_cadence')->nullable()->after('performed_rest_time');
			$table->string('planned_advanced_technique', 30)->nullable()->after('planned_cadence');
		});

		$this->backfillFromCurrentPrescription();
	}

	/**
	 * Backfill best-effort dos check-ins já existentes: casa cada série do snapshot
	 * (set_number) com a série prescrita atual (workout_exercise_series.order) do
	 * mesmo treino/exercício. Aproximação — a prescrição atual pode diferir da
	 * época do check-in —, mas é a melhor fonte disponível para dados legados.
	 */
	private function backfillFromCurrentPrescription(): void
	{
		DB::table('workout_checkin_exercise_sets as s')
			->join('workout_checkin_exercises as ce', 'ce.id', '=', 's.workout_checkin_exercise_id')
			->join('workout_checkins as c', 'c.id', '=', 'ce.workout_checkin_id')
			->join('workout_exercises as we', function ($join) {
				$join->on('we.workout_id', '=', 'c.workout_id')
					->on('we.exercise_id', '=', 'ce.exercise_id');
			})
			->join('workout_exercise_series as ser', function ($join) {
				$join->on('ser.workout_exercise_id', '=', 'we.id')
					->on('ser.order', '=', 's.set_number');
			})
			->select('s.id', 'ser.type', 'ser.rir', 'ser.cadence', 'ser.advanced_technique')
			->orderBy('s.id')
			->get()
			->each(function ($row) {
				DB::table('workout_checkin_exercise_sets')
					->where('id', $row->id)
					->update([
						'planned_type' => $row->type,
						'planned_rir' => $row->rir,
						'planned_cadence' => $row->cadence,
						'planned_advanced_technique' => $row->advanced_technique,
					]);
			});
	}

	public function down(): void
	{
		Schema::table('workout_checkin_exercise_sets', function (Blueprint $table) {
			$table->dropColumn([
				'planned_type',
				'planned_rir',
				'planned_cadence',
				'planned_advanced_technique',
			]);
		});
	}
};
