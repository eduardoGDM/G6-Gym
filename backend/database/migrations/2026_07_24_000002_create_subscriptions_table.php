<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Assinatura de um personal a um plano.
 *
 * O formato já é o que um gateway usa (status, vigência, origem), embora hoje a
 * única origem seja `manual` (atribuição pelo admin). Quando o gateway entrar,
 * basta uma migration adicionando `gateway_customer_id`/`gateway_subscription_id`
 * e um webhook gravando **nesta mesma tabela** com `source = 'asaas'` — nenhum
 * controller ou tela precisa mudar.
 *
 * O histórico é preservado: trocar de plano encerra a assinatura vigente
 * (`canceled`) e cria uma nova, em vez de sobrescrever.
 */
return new class extends Migration
{
	public function up(): void
	{
		Schema::create('subscriptions', function (Blueprint $table) {
			$table->id();

			$table->foreignId('trainer_id')->constrained('users')->cascadeOnDelete();
			$table->foreignId('plan_id')->constrained('plans')->restrictOnDelete();

			$table->string('status', 20)->default('active');

			$table->timestamp('starts_at')->nullable();

			// null = sem vencimento (assinatura manual por tempo indeterminado).
			$table->timestamp('ends_at')->nullable();

			$table->string('source', 20)->default('manual');

			// Quem atribuiu (admin). nullOnDelete: perder o admin não pode
			// apagar a assinatura do personal.
			$table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();

			$table->text('notes')->nullable();

			$table->timestamps();

			// Busca sempre feita por "assinatura vigente deste personal".
			$table->index(['trainer_id', 'status'], 'subscriptions_trainer_status_index');
		});
	}

	public function down(): void
	{
		Schema::dropIfExists('subscriptions');
	}
};
