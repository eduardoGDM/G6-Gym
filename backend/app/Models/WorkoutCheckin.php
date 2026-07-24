<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class WorkoutCheckin extends Model
{
	use HasFactory;

	protected $table = 'workout_checkins';

	protected $fillable = [
		'student_profile_id',
		'workout_id',
		'performed_at',
		'notes',
	];

	protected $casts = [
		'performed_at' => 'date',
	];

	/**
	 * comments é polimórfica (sem FK no banco), então a exclusão do check-in
	 * não cascateia sozinha — removemos os comentários junto para não deixar
	 * registros órfãos quando o aluno apaga o check-in.
	 */
	protected static function booted(): void
	{
		static::deleting(function (self $checkin) {
			$checkin->comments()->delete();
		});
	}

	public function studentProfile(): BelongsTo
	{
		return $this->belongsTo(StudentProfile::class);
	}

	public function workout(): BelongsTo
	{
		return $this->belongsTo(Workout::class);
	}

	public function exercises(): HasMany
	{
		return $this->hasMany(WorkoutCheckinExercise::class);
	}

	/**
	 * Comentários do personal sobre este check-in (mais antigos primeiro).
	 */
	public function comments(): MorphMany
	{
		return $this->morphMany(Comment::class, 'commentable')->orderBy('created_at');
	}
}
