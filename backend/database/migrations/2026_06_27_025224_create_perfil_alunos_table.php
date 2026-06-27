<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up(): void
	{
		Schema::create('perfil_alunos', function (Blueprint $table) {
			$table->id();

			$table->foreignId('user_id')
				->unique()
				->constrained()
				->cascadeOnDelete();

			$table->string('cpf', 14)->unique();

			$table->string('telefone', 20)->nullable();

			$table->date('data_nascimento')->nullable();

			$table->enum('sexo', [
				'Masculino',
				'Feminino',
				'Outro'
			])->nullable();

			$table->decimal('altura', 4, 2)->nullable();

			$table->decimal('peso_atual', 5, 2)->nullable();

			$table->string('foto')->nullable();

			$table->text('observacoes')->nullable();

			$table->timestamps();
		});
	}

	public function down(): void
	{
		Schema::dropIfExists('perfil_alunos');
	}
};
