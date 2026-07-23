<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Catálogo de planos, vendidos por **capacidade de alunos** (não por módulo).
 *
 * As colunas de limite/feature descrevem o produto — ainda **não** há qualquer
 * enforcement no código. Elas existem desde já para que a tela do admin mostre
 * o consumo real ("12/15") e o modelo de escada possa ser validado antes de
 * escrever o gate.
 */
return new class extends Migration
{
	public function up(): void
	{
		Schema::create('plans', function (Blueprint $table) {
			$table->id();

			$table->string('code', 30)->unique();
			$table->string('name');

			// Em centavos: dinheiro em float é erro de arredondamento garantido.
			$table->unsignedInteger('price_cents')->default(0);

			// null = sem limite de alunos.
			$table->unsignedInteger('student_limit')->nullable();

			$table->boolean('allows_physical_assessment')->default(false);
			$table->boolean('allows_photos')->default(false);
			$table->boolean('allows_videos')->default(false);
			$table->boolean('allows_pdf')->default(false);

			// Ordem de exibição da escada (Free → Ilimitado).
			$table->unsignedSmallInteger('sort_order')->default(0);

			$table->timestamps();
		});

		$now = now();

		DB::table('plans')->insert([
			[
				'code' => 'free',
				'name' => 'Free',
				'price_cents' => 0,
				'student_limit' => 3,
				'allows_physical_assessment' => false,
				'allows_photos' => false,
				'allows_videos' => false,
				'allows_pdf' => false,
				'sort_order' => 1,
				'created_at' => $now,
				'updated_at' => $now,
			],
			[
				'code' => 'essencial',
				'name' => 'Essencial',
				'price_cents' => 6990,
				'student_limit' => 15,
				'allows_physical_assessment' => true,
				'allows_photos' => true,
				'allows_videos' => false,
				'allows_pdf' => false,
				'sort_order' => 2,
				'created_at' => $now,
				'updated_at' => $now,
			],
			[
				'code' => 'pro',
				'name' => 'Pro',
				'price_cents' => 12990,
				'student_limit' => 40,
				'allows_physical_assessment' => true,
				'allows_photos' => true,
				'allows_videos' => true,
				'allows_pdf' => true,
				'sort_order' => 3,
				'created_at' => $now,
				'updated_at' => $now,
			],
			[
				'code' => 'ilimitado',
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
		]);
	}

	public function down(): void
	{
		Schema::dropIfExists('plans');
	}
};
