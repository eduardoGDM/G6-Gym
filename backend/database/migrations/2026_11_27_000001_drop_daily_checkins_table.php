<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Remove o Check-in Diário (sono/dieta) do sistema.
 *
 * `comments` é polimórfica e não tem FK para o alvo, então apagar a tabela
 * deixaria comentários órfãos apontando para um tipo que não existe mais —
 * removemos essas linhas antes do drop.
 *
 * O `down()` recria a estrutura (inclusive o índice de `date`, que vinha da
 * migration de índices de performance) para a rollback continuar válida. Os
 * dados, esses não voltam.
 */
return new class extends Migration
{
	private const COMMENTABLE_TYPE = 'App\Models\DailyCheckin';

	public function up(): void
	{
		DB::table('comments')
			->where('commentable_type', self::COMMENTABLE_TYPE)
			->delete();

		Schema::dropIfExists('daily_checkins');
	}

	public function down(): void
	{
		Schema::create('daily_checkins', function (Blueprint $table) {
			$table->id();

			$table->foreignId('student_profile_id')
				->constrained('student_profiles')
				->cascadeOnDelete();

			$table->date('date');

			$table->unsignedTinyInteger('sleep_rating');
			$table->text('sleep_notes')->nullable();

			$table->unsignedTinyInteger('diet_rating');
			$table->text('diet_notes')->nullable();

			$table->timestamps();

			$table->unique(['student_profile_id', 'date']);
			$table->index('date', 'daily_checkins_date_index');
		});
	}
};
