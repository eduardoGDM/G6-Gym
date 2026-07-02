<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up(): void
	{
		Schema::create('exercises', function (Blueprint $table) {
			$table->id();

			$table->foreignId('muscle_group_id')
				->constrained('muscle_groups')
				->cascadeOnDelete();

			$table->string('name');

			$table->text('description')->nullable();

			$table->string('equipment')->nullable();

			$table->string('video_url')->nullable();

			$table->timestamps();
		});
	}

	public function down(): void
	{
		Schema::dropIfExists('exercises');
	}
};
