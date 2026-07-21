<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up(): void
	{
		Schema::create('workout_checkins', function (Blueprint $table) {
			$table->id();

			$table->foreignId('student_profile_id')
				->constrained('student_profiles')
				->cascadeOnDelete();

			$table->foreignId('workout_id')
				->constrained('workouts')
				->cascadeOnDelete();

			$table->date('performed_at');

			$table->text('notes')->nullable();

			$table->timestamps();

			$table->unique(['student_profile_id', 'performed_at']);
		});
	}

	public function down(): void
	{
		Schema::dropIfExists('workout_checkins');
	}
};
