<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PerfilAluno extends Model
{
	use HasFactory;

	protected $table = 'perfil_alunos';

	protected $fillable = [
		'user_id',
		'cpf',
		'telefone',
		'data_nascimento',
		'sexo',
		'altura',
		'peso_atual',
		'foto',
		'observacoes',
	];

	protected $casts = [
		'data_nascimento' => 'date',
		'altura' => 'decimal:2',
		'peso_atual' => 'decimal:2',
	];

	public function usuario(): BelongsTo
	{
		return $this->belongsTo(User::class);
	}

	public function treinos(): HasMany
	{
		return $this->hasMany(Treino::class);
	}

	public function avaliacoesFisicas(): HasMany
	{
		return $this->hasMany(AvaliacaoFisica::class);
	}
}
