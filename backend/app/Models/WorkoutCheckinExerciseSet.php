<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkoutCheckinExerciseSet extends Model
{
	use HasFactory;

	protected $table = 'workout_checkin_exercise_sets';

	protected $fillable = [
		'workout_checkin_exercise_id',
		'set_number',
		'planned_type',
		'planned_repetitions',
		'planned_rir',
		'performed_repetitions',
		'planned_weight',
		'performed_weight',
		'planned_rest_time',
		'performed_rest_time',
		'planned_cadence',
		'planned_advanced_technique',
		'notes',
	];

	protected $casts = [
		'planned_weight' => 'decimal:2',
		'performed_weight' => 'decimal:2',
	];

	public function workoutCheckinExercise(): BelongsTo
	{
		return $this->belongsTo(WorkoutCheckinExercise::class);
	}
}
