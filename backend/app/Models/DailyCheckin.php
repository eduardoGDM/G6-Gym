<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DailyCheckin extends Model
{
	use HasFactory;

	/**
	 * Faixas do indicador de qualidade (nota 0–10): verde/amarelo/vermelho.
	 */
	public const RATING_GOOD_MIN = 7;
	public const RATING_ATTENTION_MIN = 4;

	protected $table = 'daily_checkins';

	protected $fillable = [
		'student_profile_id',
		'date',
		'sleep_rating',
		'sleep_notes',
		'diet_rating',
		'diet_notes',
	];

	protected $casts = [
		'date' => 'date',
		'sleep_rating' => 'integer',
		'diet_rating' => 'integer',
	];

	public function studentProfile(): BelongsTo
	{
		return $this->belongsTo(StudentProfile::class);
	}

	/**
	 * Converte uma nota 0–10 no nível do indicador de cor:
	 * good (🟢) | attention (🟡) | bad (🔴). Retorna null quando não há nota.
	 */
	public static function ratingLevel(?int $rating): ?string
	{
		if ($rating === null) {
			return null;
		}

		if ($rating >= self::RATING_GOOD_MIN) {
			return 'good';
		}

		if ($rating >= self::RATING_ATTENTION_MIN) {
			return 'attention';
		}

		return 'bad';
	}
}
