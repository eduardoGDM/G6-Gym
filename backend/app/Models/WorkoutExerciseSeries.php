<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkoutExerciseSeries extends Model
{
	use HasFactory;

	protected $table = 'workout_exercise_series';

	protected $fillable = [
		'workout_exercise_id',
		'order',
		'repetitions',
		'weight',
		'rest_time',
		'rir',
		'tempo',
		'cadence',
		'duration',
		'notes',
	];

	protected $casts = [
		'weight' => 'decimal:2',
	];

	public function workoutExercise(): BelongsTo
	{
		return $this->belongsTo(WorkoutExercise::class);
	}
}
