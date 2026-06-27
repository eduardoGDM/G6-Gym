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
		Schema::create('avaliacoes_fisicas', function (Blueprint $table) {

			$table->id();

			$table->foreignId('perfil_aluno_id')
				->constrained()
				->cascadeOnDelete();

			$table->date('data_avaliacao');

			$table->decimal('peso', 5, 2);

			$table->decimal('altura', 4, 2);

			$table->decimal('percentual_gordura', 5, 2)->nullable();

			$table->decimal('massa_muscular', 5, 2)->nullable();

			$table->decimal('torax', 5, 2)->nullable();

			$table->decimal('cintura', 5, 2)->nullable();

			$table->decimal('abdomen', 5, 2)->nullable();

			$table->decimal('quadril', 5, 2)->nullable();

			$table->decimal('braco_esquerdo', 5, 2)->nullable();

			$table->decimal('braco_direito', 5, 2)->nullable();

			$table->decimal('coxa_esquerda', 5, 2)->nullable();

			$table->decimal('coxa_direita', 5, 2)->nullable();

			$table->decimal('panturrilha_esquerda', 5, 2)->nullable();

			$table->decimal('panturrilha_direita', 5, 2)->nullable();

			$table->text('observacoes')->nullable();

			$table->timestamps();
		});
	}

	/**
	 * Reverse the migrations.
	 */
	public function down(): void
	{
		Schema::dropIfExists('avaliacao_fisicas');
	}
};
