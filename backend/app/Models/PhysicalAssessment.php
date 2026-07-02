<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkoutExercise extends Model
{
	use HasFactory;

	protected $table = 'workout_exercises';

	protected $fillable = [
		'workout_id',
		'exercise_id',
		'training_method_id',
		'order',
		'warm_up_sets',
		'recognition_sets',
		'valid_sets',
		'reps',
		'rir',
		'rest_seconds',
		'cadence',
		'load',
		'observations',
	];

	protected $casts = [
		'order' => 'integer',
		'warm_up_sets' => 'integer',
		'recognition_sets' => 'integer',
		'valid_sets' => 'integer',
		'rest_seconds' => 'integer',
		'load' => 'decimal:2',
	];

	public function workout(): BelongsTo
	{
		return $this->belongsTo(Workout::class);
	}

	public function exercise(): BelongsTo
	{
		return $this->belongsTo(Exercise::class);
	}

	public function trainingMethod(): BelongsTo
	{
		return $this->belongsTo(TrainingMethod::class);
	}
}
