<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Models\StudentProfile;
use App\Models\Workout;

class User extends Authenticatable
{
	use HasApiTokens, HasFactory, Notifiable;

	protected $fillable = [
		'name',
		'email',
		'password',
		'role',
		'is_active',
	];

	protected $hidden = [
		'password',
		'remember_token',
	];

	protected $casts = [
		'email_verified_at' => 'datetime',
		'password' => 'hashed',
		'is_active' => 'boolean',
	];

	public function studentProfile(): HasOne
	{
		return $this->hasOne(StudentProfile::class);
	}

	public function workoutsAsTrainer(): HasMany
	{
		return $this->hasMany(Workout::class, 'trainer_id');
	}

	public function isTrainer(): bool
	{
		return $this->role === 'trainer';
	}

	public function isStudent(): bool
	{
		return $this->role === 'student';
	}

	public function isAdmin(): bool
	{
		return $this->role === 'admin';
	}
}
