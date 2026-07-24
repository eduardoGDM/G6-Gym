<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Comentários do personal em cada ponto de contato do aluno.
 *
 * Até aqui o aluno registrava check-in diário (sono/dieta) e check-in de treino,
 * e o personal só conseguia *ler*. Esta tabela abre o caminho de volta: o
 * personal comenta em cima do próprio check-in e o aluno vê a conversa.
 *
 * O alvo é polimórfico (commentable) porque hoje são os dois tipos de check-in,
 * mas o mesmo mecanismo atende vídeos/fotos e a linha do tempo depois — sem
 * novas colunas nem novas tabelas por tipo.
 */
return new class extends Migration
{
	public function up(): void
	{
		Schema::create('comments', function (Blueprint $table) {
			$table->id();

			// morphs() já cria o índice composto (commentable_type, commentable_id).
			$table->morphs('commentable');

			// Autor do comentário. Só o personal comenta (o aluno apenas lê),
			// por isso o vínculo é direto com o trainer.
			$table->foreignId('trainer_id')
				->constrained('users')
				->cascadeOnDelete();

			$table->text('body');

			$table->timestamps();
		});
	}

	public function down(): void
	{
		Schema::dropIfExists('comments');
	}
};
