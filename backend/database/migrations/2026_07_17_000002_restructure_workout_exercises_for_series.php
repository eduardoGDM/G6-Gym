<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up(): void
	{
		Schema::table('workout_exercises', function (Blueprint $table) {
			$table->text('notes')->nullable()->after('order');
		});

		$now = now();

		DB::table('workout_exercises')->orderBy('id')->get()->each(function ($row) use ($now) {
			DB::table('workout_exercises')
				->where('id', $row->id)
				->update(['notes' => $row->observations]);

			$totalSeries = max((int) $row->valid_sets, 1);

			preg_match('/\d+/', (string) $row->reps, $matches);
			$repetitions = $matches[0] ?? null;

			for ($order = 1; $order <= $totalSeries; $order++) {
				DB::table('workout_exercise_series')->insert([
					'workout_exercise_id' => $row->id,
					'order' => $order,
					'repetitions' => $repetitions,
					'weight' => $row->load,
					'rest_time' => $row->rest_seconds,
					'rir' => is_numeric($row->rir) ? (int) $row->rir : null,
					'tempo' => null,
					'cadence' => $row->cadence,
					'duration' => null,
					'notes' => null,
					'created_at' => $now,
					'updated_at' => $now,
				]);
			}
		});

		Schema::table('workout_exercises', function (Blueprint $table) {
			$table->dropForeign(['training_method_id']);
		});

		Schema::table('workout_exercises', function (Blueprint $table) {
			$table->dropColumn([
				'training_method_id',
				'warm_up_sets',
				'recognition_sets',
				'valid_sets',
				'reps',
				'rir',
				'rest_seconds',
				'cadence',
				'load',
				'observations',
			]);
		});
	}

	public function down(): void
	{
		Schema::table('workout_exercises', function (Blueprint $table) {
			$table->foreignId('training_method_id')
				->nullable()
				->after('exercise_id')
				->constrained('training_methods')
				->nullOnDelete();

			$table->integer('warm_up_sets')->default(0)->after('order');
			$table->integer('recognition_sets')->default(0)->after('warm_up_sets');
			$table->integer('valid_sets')->default(1)->after('recognition_sets');
			$table->string('reps')->nullable()->after('valid_sets');
			$table->string('rir')->nullable()->after('reps');
			$table->integer('rest_seconds')->nullable()->after('rir');
			$table->string('cadence')->nullable()->after('rest_seconds');
			$table->decimal('load', 6, 2)->nullable()->after('cadence');
			$table->text('observations')->nullable()->after('load');
		});

		Schema::table('workout_exercises', function (Blueprint $table) {
			$table->dropColumn('notes');
		});
	}
};
