<?php

namespace App\Http\Resources;

use App\Models\PhysicalAssessment;
use App\Models\StudentProfile;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;

/**
 * Serializa uma avaliação física.
 *
 * Todos os valores derivados (IMC, RCQ, massa gorda e massa magra) são
 * calculados na leitura e nunca gravados — assim uma correção de peso ou de
 * altura reflete automaticamente no histórico inteiro.
 *
 * Cada medida vem no formato `{ value, delta }`, onde `delta` é a variação em
 * relação à avaliação imediatamente anterior (`$assessment->previousAssessment`,
 * injetada pelo controller). É essa variação que o personal envia para o aluno.
 */
class PhysicalAssessmentResource extends JsonResource
{
	/**
	 * Injeta em cada avaliação o perfil do aluno (fallback de altura do IMC) e a
	 * avaliação imediatamente anterior (base dos deltas). A coleção precisa
	 * estar ordenada da mais recente para a mais antiga.
	 *
	 * Fica aqui, e não nos controllers, porque tanto a tela do trainer quanto a
	 * do aluno precisam exatamente do mesmo preparo antes de serializar.
	 */
	public static function withComparisonContext(
		Collection $assessments,
		StudentProfile $studentProfile,
	): Collection {
		$assessments = $assessments->values();

		foreach ($assessments as $index => $assessment) {
			$assessment->setRelation('studentProfile', $studentProfile);
			$assessment->previousAssessment = $assessments->get($index + 1);
		}

		return $assessments;
	}

	public function toArray(Request $request): array
	{
		return [
			'id' => $this->id,
			'student_profile_id' => $this->student_profile_id,
			'assessment_date' => $this->assessment_date?->format('Y-m-d'),
			'notes' => $this->notes,
			'trainer' => $this->whenLoaded('trainer', fn () => $this->trainer ? [
				'id' => $this->trainer->id,
				'name' => $this->trainer->name,
			] : null),
			'measures' => $this->measures(),
			'derived' => $this->derived(),
			'created_at' => $this->created_at,
			'updated_at' => $this->updated_at,
		];
	}

	private function measures(): array
	{
		$previous = $this->previousAssessment;
		$measures = [];

		foreach (PhysicalAssessment::MEASURE_FIELDS as $field) {
			$measures[$field] = self::entry(
				self::toFloat($this->{$field}),
				self::toFloat($previous?->{$field}),
			);
		}

		return $measures;
	}

	private function derived(): array
	{
		$previous = $this->previousAssessment;

		return [
			'imc' => self::entry($this->imc(), $previous?->imc()),
			'waist_hip_ratio' => self::entry($this->waistHipRatio(), $previous?->waistHipRatio()),
			'fat_mass' => self::entry($this->fatMass(), $previous?->fatMass()),
			'lean_mass' => self::entry($this->leanMass(), $previous?->leanMass()),
		];
	}

	private static function entry(?float $value, ?float $previous): array
	{
		return [
			'value' => $value,
			'delta' => $value !== null && $previous !== null ? round($value - $previous, 2) : null,
		];
	}

	private static function toFloat($value): ?float
	{
		return $value === null ? null : (float) $value;
	}
}
