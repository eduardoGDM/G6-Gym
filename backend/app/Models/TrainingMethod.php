<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TrainingMethod extends Model
{
	use HasFactory;

	protected $table = 'training_methods';

	protected $fillable = [
		'name',
		'description'
	];

	public function workoutExercises(): HasMany
	{
		return $this->hasMany(WorkoutExercise::class);
	}
}
