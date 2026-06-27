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
		Schema::create('treino_exercicios', function (Blueprint $table) {

			$table->id();

			$table->foreignId('treino_id')
				->constrained()
				->cascadeOnDelete();

			$table->foreignId('exercicio_id')
				->constrained()
				->cascadeOnDelete();

			$table->foreignId('metodo_treino_id')
				->nullable()
				->constrained('metodos_treino')
				->nullOnDelete();

			$table->integer('ordem');

			$table->integer('series_aquecimento')->default(0);

			$table->integer('series_reconhecimento')->default(0);

			$table->integer('series_validas');

			$table->string('repeticoes');

			$table->string('rir')->nullable();

			$table->integer('descanso_segundos')->nullable();

			$table->string('cadencia')->nullable();

			$table->decimal('carga', 6, 2)->nullable();

			$table->text('observacoes')->nullable();

			$table->timestamps();
		});
	}

	/**
	 * Reverse the migrations.
	 */
	public function down(): void
	{
		Schema::dropIfExists('treino_exercicios');
	}
};
