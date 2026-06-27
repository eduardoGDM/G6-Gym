<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Exercicio extends Model
{
	use HasFactory;

	protected $table = 'exercicios';

	protected $fillable = [
		'grupo_muscular_id',
		'nome',
		'descricao',
		'equipamento',
		'video_url',
	];

	public function grupoMuscular(): BelongsTo
	{
		return $this->belongsTo(GrupoMuscular::class);
	}

	public function treinoExercicios(): HasMany
	{
		return $this->hasMany(TreinoExercicio::class);
	}
}
