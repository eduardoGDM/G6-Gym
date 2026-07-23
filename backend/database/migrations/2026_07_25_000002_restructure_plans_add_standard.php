<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Reestrutura a escada de planos (ver docs/regras-planos.md).
 *
 * Motivo: levantamento de concorrência mostrou que capacidade virou commodity
 * neste mercado — o concorrente direto vende alunos ilimitados por R$39,90.
 * A escada anterior (Essencial R$69,90 por 15 alunos, Ilimitado R$199,90) não
 * sobrevive a essa comparação.
 *
 * Escada nova:
 *
 *   Free       R$0        3 alunos    sem mídia
 *   Standard   R$29,90    20 alunos   sem mídia
 *   Essencial  R$59,90    50 alunos   + fotos
 *   Pro        R$99,90    ilimitado   + fotos e vídeos
 *
 * O Standard é o degrau de margem: **mídia é o único custo marginal real do
 * sistema**, então um plano sem foto e sem vídeo custa quase nada para servir e
 * pode ser agressivo no preço sem queimar margem.
 *
 * O antigo "Ilimitado" é absorvido pelo Pro — cinco degraus é demais para um
 * produto que ainda não vendeu, e o teto de R$199,90 era indefensável.
 */
return new class extends Migration
{
	public function up(): void
	{
		$now = now();

		// Free: 1 -> 3 alunos. Ganha a comparação na porta de entrada (o free do
		// concorrente dá 1 aluno) e segue insuficiente para tocar o negócio.
		DB::table('plans')->where('code', 'free')->update([
			'student_limit' => 3,
			'sort_order' => 1,
			'updated_at' => $now,
		]);

		DB::table('plans')->updateOrInsert(
			['code' => 'standard'],
			[
				'name' => 'Standard',
				'price_cents' => 2990,
				'student_limit' => 20,
				'allows_physical_assessment' => true,
				'allows_photos' => false,
				'allows_videos' => false,
				'allows_pdf' => true,
				'sort_order' => 2,
				'created_at' => $now,
				'updated_at' => $now,
			],
		);

		DB::table('plans')->where('code', 'essencial')->update([
			'price_cents' => 5990,
			'student_limit' => 50,
			'allows_photos' => true,
			'allows_videos' => false,
			'sort_order' => 3,
			'updated_at' => $now,
		]);

		// Pro absorve o antigo Ilimitado: passa a ser o teto, sem limite de alunos.
		DB::table('plans')->where('code', 'pro')->update([
			'price_cents' => 9990,
			'student_limit' => null,
			'allows_photos' => true,
			'allows_videos' => true,
			'sort_order' => 4,
			'updated_at' => $now,
		]);

		$this->replacePlan('ilimitado', 'pro');
	}

	public function down(): void
	{
		$now = now();

		DB::table('plans')->updateOrInsert(
			['code' => 'ilimitado'],
			[
				'name' => 'Ilimitado',
				'price_cents' => 19990,
				'student_limit' => null,
				'allows_physical_assessment' => true,
				'allows_photos' => true,
				'allows_videos' => true,
				'allows_pdf' => true,
				'sort_order' => 4,
				'created_at' => $now,
				'updated_at' => $now,
			],
		);

		DB::table('plans')->where('code', 'free')->update([
			'student_limit' => 1,
			'updated_at' => $now,
		]);

		DB::table('plans')->where('code', 'essencial')->update([
			'price_cents' => 6990,
			'student_limit' => 15,
			'sort_order' => 2,
			'updated_at' => $now,
		]);

		DB::table('plans')->where('code', 'pro')->update([
			'price_cents' => 12990,
			'student_limit' => 40,
			'sort_order' => 3,
			'updated_at' => $now,
		]);

		$this->replacePlan('standard', 'essencial');
	}

	/**
	 * Remove um plano com segurança: move as assinaturas que apontam para ele
	 * antes do delete. A FK `plan_id` é restrictOnDelete, então sem isso a
	 * migration quebraria em qualquer ambiente que já tivesse assinaturas.
	 */
	private function replacePlan(string $fromCode, string $toCode): void
	{
		$from = DB::table('plans')->where('code', $fromCode)->first();
		$to = DB::table('plans')->where('code', $toCode)->first();

		if (!$from || !$to) {
			return;
		}

		DB::table('subscriptions')
			->where('plan_id', $from->id)
			->update(['plan_id' => $to->id, 'updated_at' => now()]);

		DB::table('plans')->where('id', $from->id)->delete();
	}
};
