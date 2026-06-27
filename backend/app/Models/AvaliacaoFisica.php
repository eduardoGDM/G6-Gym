<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AvaliacaoFisica extends Model
{
	use HasFactory;

	protected $table = 'avaliacoes_fisicas';

	protected $fillable = [
		'perfil_aluno_id',
		'data_avaliacao',
		'peso',
		'altura',
		'percentual_gordura',
		'massa_muscular',
		'torax',
		'cintura',
		'abdomen',
		'quadril',
		'braco_esquerdo',
		'braco_direito',
		'coxa_esquerda',
		'coxa_direita',
		'panturrilha_esquerda',
		'panturrilha_direita',
		'observacoes',
	];

	protected $casts = [
		'data_avaliacao' => 'date',
		'peso' => 'decimal:2',
		'altura' => 'decimal:2',
		'percentual_gordura' => 'decimal:2',
		'massa_muscular' => 'decimal:2',
		'torax' => 'decimal:2',
		'cintura' => 'decimal:2',
		'abdomen' => 'decimal:2',
		'quadril' => 'decimal:2',
		'braco_esquerdo' => 'decimal:2',
		'braco_direito' => 'decimal:2',
		'coxa_esquerda' => 'decimal:2',
		'coxa_direita' => 'decimal:2',
		'panturrilha_esquerda' => 'decimal:2',
		'panturrilha_direita' => 'decimal:2',
	];

	public function perfilAluno(): BelongsTo
	{
		return $this->belongsTo(PerfilAluno::class);
	}
}
