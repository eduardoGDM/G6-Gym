<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up(): void
	{
		Schema::create('workout_exercise_series', function (Blueprint $table) {
			$table->id();

			$table->foreignId('workout_exercise_id')
				->constrained()
				->cascadeOnDelete();

			$table->integer('order')->default(1);

			$table->integer('repetitions')->nullable();

			$table->decimal('weight', 6, 2)->nullable();

			$table->integer('rest_time')->nullable();

			$table->integer('rir')->nullable();

			$table->string('tempo')->nullable();

			$table->string('cadence')->nullable();

			$table->integer('duration')->nullable();

			$table->text('notes')->nullable();

			$table->timestamps();
		});
	}

	public function down(): void
	{
		Schema::dropIfExists('workout_exercise_series');
	}
};
