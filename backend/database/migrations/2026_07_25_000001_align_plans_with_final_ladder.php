<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Alinha o seed dos planos com a escada final (ver docs/regras-planos.md).
 *
 * Três mudanças em relação ao seed original:
 *
 * 1. Free cai de 3 para **1 aluno**. Com 3, um personal iniciante roda o negócio
 *    de graça para sempre; com 1 fica inequívoco que é demonstração.
 *
 * 2. Free ganha a **avaliação física**. Parece contraintuitivo soltar o gancho de
 *    conversão, mas gancho que ninguém vê não fisga: o personal precisa registrar
 *    uma avaliação e ver o delta para querer isso nos 15 alunos dele. Com o Free
 *    em 1 aluno, quem cobra é a capacidade, não a feature.
 *
 * 3. O **PDF deixa de ser diferencial** e vai para todos os planos. Não é
 *    capacidade nem custo marginal, e é a peça que sai com a marca do produto
 *    para o aluno final — travar só faz o personal mandar a ficha na mão.
 *
 * Resultado: as únicas features presas à escada passam a ser fotos e vídeos, que
 * são as que têm custo marginal real (storage e banda).
 */
return new class extends Migration
{
	public function up(): void
	{
		DB::table('plans')->where('code', 'free')->update([
			'student_limit' => 1,
			'allows_physical_assessment' => true,
			'updated_at' => now(),
		]);

		DB::table('plans')->update([
			'allows_pdf' => true,
			'updated_at' => now(),
		]);
	}

	public function down(): void
	{
		DB::table('plans')->where('code', 'free')->update([
			'student_limit' => 3,
			'allows_physical_assessment' => false,
			'allows_pdf' => false,
			'updated_at' => now(),
		]);

		DB::table('plans')->where('code', 'essencial')->update([
			'allows_pdf' => false,
			'updated_at' => now(),
		]);
	}
};
