<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GrupoMuscular extends Model
{
	use HasFactory;

	protected $table = 'grupos_musculares';

	protected $fillable = [
		'nome',
	];

	public function exercicios(): HasMany
	{
		return $this->hasMany(Exercicio::class);
	}
}
