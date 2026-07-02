<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up(): void
	{
		Schema::create('workouts', function (Blueprint $table) {
			$table->id();

			$table->foreignId('student_profile_id')
				->constrained('student_profiles')
				->cascadeOnDelete();

			$table->foreignId('trainer_id')
				->constrained('users')
				->cascadeOnDelete();

			$table->string('name');

			$table->text('description')->nullable();

			$table->date('start_date');

			$table->date('end_date')->nullable();

			$table->boolean('active')->default(true);

			$table->timestamps();
		});
	}

	public function down(): void
	{
		Schema::dropIfExists('workouts');
	}
};
