<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Workout extends Model
{
	use HasFactory;

	protected $table = 'workouts';

	protected $fillable = [
		'student_profile_id',
		'trainer_id',
		'name',
		'description',
		'start_date',
		'end_date',
		'active',
	];

	protected $casts = [
		'start_date' => 'date',
		'end_date' => 'date',
		'active' => 'boolean',
	];

	public function studentProfile(): BelongsTo
	{
		return $this->belongsTo(StudentProfile::class);
	}

	public function trainer(): BelongsTo
	{
		return $this->belongsTo(User::class, 'trainer_id');
	}

	public function workoutExercises(): HasMany
	{
		return $this->hasMany(WorkoutExercise::class);
	}
}
