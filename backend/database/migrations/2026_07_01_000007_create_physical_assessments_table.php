<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up(): void
	{
		Schema::create('physical_assessments', function (Blueprint $table) {
			$table->id();

			$table->foreignId('student_profile_id')
				->constrained('student_profiles')
				->cascadeOnDelete();

			$table->date('assessment_date');

			$table->decimal('weight', 5, 2);

			$table->decimal('height', 4, 2);

			$table->decimal('fat_percentage', 5, 2)->nullable();

			$table->decimal('muscle_mass', 5, 2)->nullable();

			$table->decimal('chest', 5, 2)->nullable();

			$table->decimal('waist', 5, 2)->nullable();

			$table->decimal('abdomen', 5, 2)->nullable();

			$table->decimal('hip', 5, 2)->nullable();

			$table->decimal('left_arm', 5, 2)->nullable();

			$table->decimal('right_arm', 5, 2)->nullable();

			$table->decimal('left_thigh', 5, 2)->nullable();

			$table->decimal('right_thigh', 5, 2)->nullable();

			$table->decimal('left_calf', 5, 2)->nullable();

			$table->decimal('right_calf', 5, 2)->nullable();

			$table->timestamps();
		});
	}

	public function down(): void
	{
		Schema::dropIfExists('physical_assessments');
	}
};
