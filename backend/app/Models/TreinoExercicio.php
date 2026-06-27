<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TreinoExercicio extends Model
{
	use HasFactory;

	protected $table = 'treino_exercicios';

	protected $fillable = [
		'treino_id',
		'exercicio_id',
		'metodo_treino_id',
		'ordem',
		'series_aquecimento',
		'series_reconhecimento',
		'series_validas',
		'repeticoes',
		'rir',
		'descanso_segundos',
		'cadencia',
		'carga',
		'observacoes',
	];

	protected $casts = [
		'ordem' => 'integer',
		'series_aquecimento' => 'integer',
		'series_reconhecimento' => 'integer',
		'series_validas' => 'integer',
		'descanso_segundos' => 'integer',
		'carga' => 'decimal:2',
	];

	public function treino(): BelongsTo
	{
		return $this->belongsTo(Treino::class);
	}

	public function exercicio(): BelongsTo
	{
		return $this->belongsTo(Exercicio::class);
	}

	public function metodoTreino(): BelongsTo
	{
		return $this->belongsTo(MetodoTreino::class);
	}
}
