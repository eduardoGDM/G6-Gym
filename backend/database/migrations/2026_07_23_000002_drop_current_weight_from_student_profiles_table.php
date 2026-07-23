<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Remove `student_profiles.current_weight`: o peso atual passa a ser derivado
 * da avaliação física mais recente, mantendo uma única fonte da verdade.
 *
 * Antes do drop, cada peso já cadastrado vira uma avaliação física inicial
 * (datada pela criação do perfil), para que nenhum dado seja perdido.
 */
return new class extends Migration
{
	public function up(): void
	{
		$now = now();

		DB::table('student_profiles')
			->whereNotNull('current_weight')
			->chunkById(200, function ($profiles) use ($now) {
				$rows = [];

				foreach ($profiles as $profile) {
					$rows[] = [
						'student_profile_id' => $profile->id,
						'assessment_date' => ($profile->created_at ? Carbon::parse($profile->created_at) : $now)
							->toDateString(),
						'weight' => $profile->current_weight,
						'created_at' => $now,
						'updated_at' => $now,
					];
				}

				DB::table('physical_assessments')->insert($rows);
			});

		Schema::table('student_profiles', function (Blueprint $table) {
			$table->dropColumn('current_weight');
		});
	}

	public function down(): void
	{
		Schema::table('student_profiles', function (Blueprint $table) {
			$table->decimal('current_weight', 5, 2)->nullable()->after('height');
		});

		// Reconstrói o peso atual a partir da avaliação mais recente de cada aluno.
		DB::table('student_profiles')->orderBy('id')->chunk(200, function ($profiles) {
			foreach ($profiles as $profile) {
				$weight = DB::table('physical_assessments')
					->where('student_profile_id', $profile->id)
					->whereNotNull('weight')
					->orderByDesc('assessment_date')
					->orderByDesc('id')
					->value('weight');

				if ($weight !== null) {
					DB::table('student_profiles')
						->where('id', $profile->id)
						->update(['current_weight' => $weight]);
				}
			}
		});
	}
};
