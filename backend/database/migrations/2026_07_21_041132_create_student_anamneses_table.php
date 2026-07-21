<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up(): void
	{
		Schema::create('student_anamneses', function (Blueprint $table) {
			$table->id();

			$table->foreignId('student_profile_id')
				->unique()
				->constrained('student_profiles')
				->cascadeOnDelete();

			$table->text('observations')->nullable();

			$table->timestamps();
		});
	}

	public function down(): void
	{
		Schema::dropIfExists('student_anamneses');
	}
};
