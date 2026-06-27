<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MetodoTreino extends Model
{
	use HasFactory;

	protected $table = 'metodos_treino';

	protected $fillable = [
		'nome',
		'descricao',
	];

	public function treinoExercicios(): HasMany
	{
		return $this->hasMany(TreinoExercicio::class);
	}
}
