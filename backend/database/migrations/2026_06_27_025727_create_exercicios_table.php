<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	/**
	 * Run the migrations.
	 */
	public function up(): void
	{
		Schema::create('exercicios', function (Blueprint $table) {

			$table->id();

			$table->foreignId('grupo_muscular_id')
				->constrained('grupos_musculares')
				->cascadeOnDelete();

			$table->string('nome');

			$table->text('descricao')->nullable();

			$table->string('equipamento')->nullable();

			$table->string('video_url')->nullable();

			$table->timestamps();
		});
	}

	/**
	 * Reverse the migrations.
	 */
	public function down(): void
	{
		Schema::dropIfExists('exercicios');
	}
};
