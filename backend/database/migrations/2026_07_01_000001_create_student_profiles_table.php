<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up(): void
	{
		Schema::create('student_profiles', function (Blueprint $table) {
			$table->id();

			$table->foreignId('user_id')
				->unique()
				->constrained()
				->cascadeOnDelete();

			$table->string('cpf', 14)->unique();

			$table->string('phone', 20)->nullable();

			$table->date('birth_date')->nullable();

			$table->enum('gender', [
				'Masculino',
				'Feminino',
				'Outro'
			])->nullable();

			$table->decimal('height', 4, 2)->nullable();

			$table->decimal('current_weight', 5, 2)->nullable();

			$table->string('photo')->nullable();

			$table->text('observations')->nullable();

			$table->timestamps();
		});
	}

	public function down(): void
	{
		Schema::dropIfExists('student_profiles');
	}
};
