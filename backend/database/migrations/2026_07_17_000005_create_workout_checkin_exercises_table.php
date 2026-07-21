<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up(): void
	{
		Schema::create('workout_checkin_exercises', function (Blueprint $table) {
			$table->id();

			$table->foreignId('workout_checkin_id')
				->constrained('workout_checkins')
				->cascadeOnDelete();

			$table->foreignId('exercise_id')
				->constrained('exercises')
				->cascadeOnDelete();

			$table->decimal('weight', 6, 2)->nullable();

			$table->integer('repetitions')->nullable();

			$table->text('notes')->nullable();

			$table->timestamps();
		});
	}

	public function down(): void
	{
		Schema::dropIfExists('workout_checkin_exercises');
	}
};
