<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up(): void
	{
		Schema::create('student_anamnesis_videos', function (Blueprint $table) {
			$table->id();

			$table->foreignId('student_anamnesis_id')
				->constrained('student_anamneses')
				->cascadeOnDelete();

			$table->string('title')->nullable();

			$table->string('url');

			$table->timestamps();
		});
	}

	public function down(): void
	{
		Schema::dropIfExists('student_anamnesis_videos');
	}
};
