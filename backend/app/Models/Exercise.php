<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Exercise extends Model
{
	use HasFactory;

	protected $table = 'exercises';

	protected $fillable = [
		'muscle_group_id',
		'name',
		'description',
		'equipment',
		'video_url',
	];

	public function muscleGroup(): BelongsTo
	{
		return $this->belongsTo(MuscleGroup::class);
	}

	public function workoutExercises(): HasMany
	{
		return $this->hasMany(WorkoutExercise::class);
	}
}
