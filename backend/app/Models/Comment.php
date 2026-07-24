<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Comment extends Model
{
	use HasFactory;

	protected $table = 'comments';

	protected $fillable = [
		'commentable_type',
		'commentable_id',
		'trainer_id',
		'body',
	];

	/**
	 * Alvo do comentário (DailyCheckin, WorkoutCheckin, ...).
	 */
	public function commentable(): MorphTo
	{
		return $this->morphTo();
	}

	/**
	 * Personal autor do comentário.
	 */
	public function trainer(): BelongsTo
	{
		return $this->belongsTo(User::class, 'trainer_id');
	}
}
