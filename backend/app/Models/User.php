<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
	use HasApiTokens, HasFactory, Notifiable;

	protected $fillable = [
		'name',
		'email',
		'password',
		'role',
	];

	protected $hidden = [
		'password',
		'remember_token',
	];

	protected $casts = [
		'email_verified_at' => 'datetime',
		'password' => 'hashed',
	];

	public function perfilAluno(): HasOne
	{
		return $this->hasOne(PerfilAluno::class);
	}

	public function treinosComoPersonal(): HasMany
	{
		return $this->hasMany(Treino::class, 'personal_id');
	}

	public function isPersonal(): bool
	{
		return $this->role === 'personal';
	}

	public function isAluno(): bool
	{
		return $this->role === 'aluno';
	}
}
