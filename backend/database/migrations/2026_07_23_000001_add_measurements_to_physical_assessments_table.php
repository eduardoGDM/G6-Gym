<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Dá vida à tabela de avaliação física (criada em 2026_07_01, nunca usada).
 *
 * O "Modo Simples" da avaliação registra peso, circunferências e o percentual
 * de gordura digitado (vindo da balança de bioimpedância). Por isso nenhuma
 * medida é obrigatória: a única informação indispensável é a data, sem a qual
 * não há como ordenar o histórico nem calcular a variação entre avaliações.
 *
 * As colunas já existentes `left_arm` / `right_arm` passam a significar
 * **braço relaxado**, complementadas aqui pelo braço contraído.
 */
return new class extends Migration
{
	public function up(): void
	{
		// weight e height eram NOT NULL. Obrigar o personal a redigitar a altura
		// (que muda raramente) em toda reavaliação é atrito desnecessário, e o
		// peso pode simplesmente não ter sido medido no dia.
		Schema::table('physical_assessments', function (Blueprint $table) {
			$table->decimal('weight', 5, 2)->nullable()->change();
			$table->decimal('height', 4, 2)->nullable()->change();
		});

		Schema::table('physical_assessments', function (Blueprint $table) {
			$table->foreignId('trainer_id')
				->nullable()
				->after('student_profile_id')
				->constrained('users')
				->nullOnDelete();

			$table->decimal('neck', 5, 2)->nullable()->after('muscle_mass');
			$table->decimal('shoulder', 5, 2)->nullable()->after('neck');

			$table->decimal('left_arm_contracted', 5, 2)->nullable()->after('right_arm');
			$table->decimal('right_arm_contracted', 5, 2)->nullable()->after('left_arm_contracted');
			$table->decimal('left_forearm', 5, 2)->nullable()->after('right_arm_contracted');
			$table->decimal('right_forearm', 5, 2)->nullable()->after('left_forearm');

			$table->text('notes')->nullable()->after('right_calf');
		});
	}

	public function down(): void
	{
		Schema::table('physical_assessments', function (Blueprint $table) {
			$table->dropConstrainedForeignId('trainer_id');

			$table->dropColumn([
				'neck',
				'shoulder',
				'left_arm_contracted',
				'right_arm_contracted',
				'left_forearm',
				'right_forearm',
				'notes',
			]);
		});

		Schema::table('physical_assessments', function (Blueprint $table) {
			$table->decimal('weight', 5, 2)->nullable(false)->change();
			$table->decimal('height', 4, 2)->nullable(false)->change();
		});
	}
};
