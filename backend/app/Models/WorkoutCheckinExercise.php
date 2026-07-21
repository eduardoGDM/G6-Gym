<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkoutCheckinExercise extends Model
{
	use HasFactory;

	protected $table = 'workout_checkin_exercises';

	protected $fillable = [
		'workout_checkin_id',
		'exercise_id',
		'notes',
	];

	public function workoutCheckin(): BelongsTo
	{
		return $this->belongsTo(WorkoutCheckin::class);
	}

	public function exercise(): BelongsTo
	{
		return $this->belongsTo(Exercise::class);
	}

	public function sets(): HasMany
	{
		return $this->hasMany(WorkoutCheckinExerciseSet::class)->orderBy('set_number');
	}
}
