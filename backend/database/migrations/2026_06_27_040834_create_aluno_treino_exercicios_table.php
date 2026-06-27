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
		Schema::create('aluno_treino_exercicios', function (Blueprint $table) {
			$table->id();

			$table->foreignId('perfil_aluno_id')->constrained()->cascadeOnDelete();
			$table->foreignId('treino_exercicio_id')->constrained()->cascadeOnDelete();
			$table->decimal('carga_real', 5, 2)->nullable();
			$table->string('repeticoes_real')->nullable();
			$table->integer('series_feitas')->nullable();
			$table->text('observacoes')->nullable();

			$table->enum('status', [
				'nao_feito',
				'parcial',
				'completo'
			])->default('nao_feito');

			$table->timestamp('executado_em')->nullable();

			$table->timestamps();
		});
	}

	/**
	 * Reverse the migrations.
	 */
	public function down(): void
	{
		Schema::dropIfExists('aluno_treino_exercicios');
	}
};
