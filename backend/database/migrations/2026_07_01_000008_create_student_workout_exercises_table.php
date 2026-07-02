<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up(): void
	{
		Schema::create('student_workout_exercises', function (Blueprint $table) {
			$table->id();

			$table->foreignId('student_profile_id')
				->constrained('student_profiles')
				->cascadeOnDelete();

			$table->foreignId('workout_exercise_id')
				->constrained()
				->cascadeOnDelete();

			$table->decimal('actual_load', 5, 2)->nullable();

			$table->string('actual_reps')->nullable();

			$table->integer('sets_completed')->nullable();

			$table->text('observations')->nullable();

			$table->enum('status', [
				'not_done',
				'partial',
				'complete'
			])->default('not_done');

			$table->timestamp('executed_at')->nullable();

			$table->timestamps();
		});
	}

	public function down(): void
	{
		Schema::dropIfExists('student_workout_exercises');
	}
};
