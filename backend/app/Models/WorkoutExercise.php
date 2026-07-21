<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkoutExercise extends Model
{
	use HasFactory;

	protected $table = 'workout_exercises';

	protected $fillable = [
		'workout_id',
		'exercise_id',
		'order',
		'notes',
	];

	public function workout(): BelongsTo
	{
		return $this->belongsTo(Workout::class);
	}

	public function exercise(): BelongsTo
	{
		return $this->belongsTo(Exercise::class);
	}

	public function series(): HasMany
	{
		return $this->hasMany(WorkoutExerciseSeries::class)->orderBy('order');
	}
}
