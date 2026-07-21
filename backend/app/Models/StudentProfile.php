<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class StudentProfile extends Model
{
	use HasFactory;

	protected $table = 'student_profiles';

	protected $fillable = [
		'user_id',
		'cpf',
		'phone',
		'birth_date',
		'gender',
		'height',
		'current_weight',
		'photo',
		'observations',
	];

	protected $casts = [
		'birth_date' => 'date',
		'height' => 'decimal:2',
		'current_weight' => 'decimal:2',
	];

	public function user(): BelongsTo
	{
		return $this->belongsTo(User::class);
	}

	public function workouts(): HasMany
	{
		return $this->hasMany(Workout::class);
	}

	public function latestWorkout(): HasOne
	{
		return $this->hasOne(Workout::class)->latestOfMany();
	}

	public function physicalAssessments(): HasMany
	{
		return $this->hasMany(PhysicalAssessment::class);
	}

	public function workoutCheckins(): HasMany
	{
		return $this->hasMany(WorkoutCheckin::class);
	}

	public function dailyCheckins(): HasMany
	{
		return $this->hasMany(DailyCheckin::class);
	}

	public function anamnesis(): HasOne
	{
		return $this->hasOne(StudentAnamnesis::class);
	}
}
