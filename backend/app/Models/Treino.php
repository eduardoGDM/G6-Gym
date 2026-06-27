<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Treino extends Model
{
	use HasFactory;

	protected $table = 'treinos';

	protected $fillable = [
		'perfil_aluno_id',
		'personal_id',
		'nome',
		'descricao',
		'data_inicio',
		'data_fim',
		'ativo',
	];

	protected $casts = [
		'data_inicio' => 'date',
		'data_fim' => 'date',
		'ativo' => 'boolean',
	];

	public function perfilAluno(): BelongsTo
	{
		return $this->belongsTo(PerfilAluno::class);
	}

	public function personal(): BelongsTo
	{
		return $this->belongsTo(User::class, 'personal_id');
	}

	public function treinoExercicios(): HasMany
	{
		return $this->hasMany(TreinoExercicio::class);
	}
}
