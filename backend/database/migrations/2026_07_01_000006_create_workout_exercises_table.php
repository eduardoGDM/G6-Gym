<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up(): void
	{
		Schema::create('workout_exercises', function (Blueprint $table) {
			$table->id();

			$table->foreignId('workout_id')
				->constrained()
				->cascadeOnDelete();

			$table->foreignId('exercise_id')
				->constrained()
				->cascadeOnDelete();

			$table->foreignId('training_method_id')
				->nullable()
				->constrained('training_methods')
				->nullOnDelete();

			$table->integer('order');

			$table->integer('warm_up_sets')->default(0);

			$table->integer('recognition_sets')->default(0);

			$table->integer('valid_sets');

			$table->string('reps');

			$table->string('rir')->nullable();

			$table->integer('rest_seconds')->nullable();

			$table->string('cadence')->nullable();

			$table->decimal('load', 6, 2)->nullable();

			$table->text('observations')->nullable();

			$table->timestamps();
		});
	}

	public function down(): void
	{
		Schema::dropIfExists('workout_exercises');
	}
};
