<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up(): void
	{
		Schema::create('daily_checkins', function (Blueprint $table) {
			$table->id();

			$table->foreignId('student_profile_id')
				->constrained('student_profiles')
				->cascadeOnDelete();

			$table->date('date');

			$table->unsignedTinyInteger('sleep_rating');
			$table->text('sleep_notes')->nullable();

			$table->unsignedTinyInteger('diet_rating');
			$table->text('diet_notes')->nullable();

			$table->timestamps();

			$table->unique(['student_profile_id', 'date']);
		});
	}

	public function down(): void
	{
		Schema::dropIfExists('daily_checkins');
	}
};
