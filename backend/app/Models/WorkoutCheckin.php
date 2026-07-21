<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
}
