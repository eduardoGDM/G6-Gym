<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up(): void
	{
		Schema::create('workout_muscle_groups', function (Blueprint $table) {
			$table->id();

			$table->foreignId('workout_id')
				->constrained()
				->cascadeOnDelete();

			$table->foreignId('muscle_group_id')
				->constrained('muscle_groups')
				->cascadeOnDelete();

			$table->timestamps();

			$table->unique(['workout_id', 'muscle_group_id']);
		});
	}

	public function down(): void
	{
		Schema::dropIfExists('workout_muscle_groups');
	}
};
