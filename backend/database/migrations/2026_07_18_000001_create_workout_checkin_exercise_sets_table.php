<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up(): void
	{
		Schema::create('workout_checkin_exercise_sets', function (Blueprint $table) {
			$table->id();

			$table->foreignId('workout_checkin_exercise_id')
				->constrained('workout_checkin_exercises', 'id', 'wc_exercise_sets_exercise_id_foreign')
				->cascadeOnDelete();

			$table->unsignedInteger('set_number')->default(1);

			$table->integer('planned_repetitions')->nullable();
			$table->integer('performed_repetitions')->nullable();

			$table->decimal('planned_weight', 6, 2)->nullable();
			$table->decimal('performed_weight', 6, 2)->nullable();

			$table->integer('planned_rest_time')->nullable();
			$table->integer('performed_rest_time')->nullable();

			$table->boolean('completed')->default(false);

			$table->text('notes')->nullable();

			$table->timestamps();
		});

		// Compatibilidade: check-ins registrados antes do modelo por série viram uma única série (nº 1),
		// preservando a carga/repetições já executadas no histórico do aluno.
		$now = now();

		DB::table('workout_checkin_exercises')->orderBy('id')->get()->each(function ($row) use ($now) {
			DB::table('workout_checkin_exercise_sets')->insert([
				'workout_checkin_exercise_id' => $row->id,
				'set_number' => 1,
				'planned_repetitions' => null,
				'performed_repetitions' => $row->repetitions,
				'planned_weight' => null,
				'performed_weight' => $row->weight,
				'planned_rest_time' => null,
				'performed_rest_time' => null,
				'completed' => !is_null($row->weight) || !is_null($row->repetitions),
				'notes' => null,
				'created_at' => $now,
				'updated_at' => $now,
			]);
		});
	}

	public function down(): void
	{
		Schema::dropIfExists('workout_checkin_exercise_sets');
	}
};
