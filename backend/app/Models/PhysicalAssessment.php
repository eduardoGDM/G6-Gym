<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PhysicalAssessment extends Model
{
	use HasFactory;

	/**
	 * Composição corporal. `fat_percentage` e `muscle_mass` são digitados a
	 * partir da balança de bioimpedância — não são calculados aqui.
	 */
	public const COMPOSITION_FIELDS = [
		'weight',
		'height',
		'fat_percentage',
		'muscle_mass',
	];

	/**
	 * Circunferências em centímetros. `left_arm` / `right_arm` são o braço
	 * relaxado; o contraído tem colunas próprias.
	 */
	public const CIRCUMFERENCE_FIELDS = [
		'neck',
		'shoulder',
		'chest',
		'waist',
		'abdomen',
		'hip',
		'left_arm',
		'right_arm',
		'left_arm_contracted',
		'right_arm_contracted',
		'left_forearm',
		'right_forearm',
		'left_thigh',
		'right_thigh',
		'left_calf',
		'right_calf',
	];

	/** Todas as medidas numéricas da avaliação. */
	public const MEASURE_FIELDS = [
		...self::COMPOSITION_FIELDS,
		...self::CIRCUMFERENCE_FIELDS,
	];

	protected $table = 'physical_assessments';

	/**
	 * Avaliação imediatamente anterior à esta, usada apenas na leitura para
	 * calcular a variação de cada medida. É uma propriedade real da classe
	 * (não um atributo do Eloquent), portanto nunca é persistida.
	 *
	 * O nome não pode ser apenas `previous`: o Eloquent já usa essa propriedade
	 * internamente (HasAttributes::$previous).
	 */
	public ?self $previousAssessment = null;

	protected $fillable = [
		'student_profile_id',
		'trainer_id',
		'assessment_date',
		'notes',
		...self::MEASURE_FIELDS,
	];

	protected $casts = [
		'assessment_date' => 'date',
		'weight' => 'decimal:2',
		'height' => 'decimal:2',
		'fat_percentage' => 'decimal:2',
		'muscle_mass' => 'decimal:2',
		'neck' => 'decimal:2',
		'shoulder' => 'decimal:2',
		'chest' => 'decimal:2',
		'waist' => 'decimal:2',
		'abdomen' => 'decimal:2',
		'hip' => 'decimal:2',
		'left_arm' => 'decimal:2',
		'right_arm' => 'decimal:2',
		'left_arm_contracted' => 'decimal:2',
		'right_arm_contracted' => 'decimal:2',
		'left_forearm' => 'decimal:2',
		'right_forearm' => 'decimal:2',
		'left_thigh' => 'decimal:2',
		'right_thigh' => 'decimal:2',
		'left_calf' => 'decimal:2',
		'right_calf' => 'decimal:2',
	];

	public function studentProfile(): BelongsTo
	{
		return $this->belongsTo(StudentProfile::class);
	}

	public function trainer(): BelongsTo
	{
		return $this->belongsTo(User::class, 'trainer_id');
	}

	/**
	 * Altura usada nos cálculos: a da própria avaliação quando informada
	 * (override pontual), senão a do cadastro do aluno.
	 */
	public function effectiveHeight(): ?float
	{
		$height = $this->height ?? $this->studentProfile?->height;

		return $height === null ? null : (float) $height;
	}

	public function imc(): ?float
	{
		$height = $this->effectiveHeight();

		if ($this->weight === null || !$height) {
			return null;
		}

		return round((float) $this->weight / ($height ** 2), 2);
	}

	/** Relação cintura/quadril (RCQ). */
	public function waistHipRatio(): ?float
	{
		if ($this->waist === null || !(float) $this->hip) {
			return null;
		}

		return round((float) $this->waist / (float) $this->hip, 2);
	}

	public function fatMass(): ?float
	{
		if ($this->weight === null || $this->fat_percentage === null) {
			return null;
		}

		return round((float) $this->weight * (float) $this->fat_percentage / 100, 2);
	}

	/**
	 * Massa magra = peso - massa gorda. Não confundir com `muscle_mass`, que é
	 * um valor digitado da balança e mede outra grandeza.
	 */
	public function leanMass(): ?float
	{
		$fatMass = $this->fatMass();

		if ($this->weight === null || $fatMass === null) {
			return null;
		}

		return round((float) $this->weight - $fatMass, 2);
	}
}
