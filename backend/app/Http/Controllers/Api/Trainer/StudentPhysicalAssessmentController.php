<?php

namespace App\Http\Controllers\Api\Trainer;

use App\Http\Controllers\Controller;
use App\Http\Resources\PhysicalAssessmentResource;
use App\Models\PhysicalAssessment;
use App\Models\StudentProfile;
use Illuminate\Http\Request;

/**
 * Avaliação física do aluno.
 *
 * Diferente da anamnese (que é um registro único por aluno), a avaliação é uma
 * série temporal: são N registros datados, e o valor da feature está justamente
 * na comparação entre eles. Por isso o CRUD é completo.
 */
class StudentPhysicalAssessmentController extends Controller
{
	/**
	 * Admin tem visão global; trainer só acessa alunos vinculados a ele.
	 */
	private function scopeToTrainer($query, Request $request)
	{
		if ($request->user()->role === 'admin') {
			return $query;
		}

		return $query->where('trainer_id', $request->user()->id);
	}

	private function findStudent(Request $request, $student): ?StudentProfile
	{
		return $this->scopeToTrainer(StudentProfile::query(), $request)->find($student);
	}

	public function index(Request $request, $student)
	{
		$studentProfile = $this->findStudent($request, $student);

		if (!$studentProfile) {
			return response()->json(['message' => 'Aluno não encontrado'], 404);
		}

		$assessments = $studentProfile->physicalAssessments()->with('trainer')->get();

		return PhysicalAssessmentResource::collection(
			PhysicalAssessmentResource::withComparisonContext($assessments, $studentProfile),
		);
	}

	public function store(Request $request, $student)
	{
		$studentProfile = $this->findStudent($request, $student);

		if (!$studentProfile) {
			return response()->json(['message' => 'Aluno não encontrado'], 404);
		}

		$data = $request->validate($this->rules());

		if ($this->hasNoMeasures($data)) {
			return response()->json([
				'message' => 'Informe ao menos uma medida para registrar a avaliação',
			], 422);
		}

		$assessment = $studentProfile->physicalAssessments()->create([
			...$data,
			'trainer_id' => $request->user()->id,
		]);

		return response()->json([
			'message' => 'Avaliação física criada com sucesso',
			'assessment' => $this->presentOne($assessment, $studentProfile),
		], 201);
	}

	public function update(Request $request, $student, $assessment)
	{
		$studentProfile = $this->findStudent($request, $student);

		if (!$studentProfile) {
			return response()->json(['message' => 'Aluno não encontrado'], 404);
		}

		$physicalAssessment = $studentProfile->physicalAssessments()->find($assessment);

		if (!$physicalAssessment) {
			return response()->json(['message' => 'Avaliação física não encontrada'], 404);
		}

		$data = $request->validate($this->rules());

		if ($this->hasNoMeasures($data)) {
			return response()->json([
				'message' => 'Informe ao menos uma medida para registrar a avaliação',
			], 422);
		}

		// trainer_id é preservado de propósito: registra quem realizou a
		// avaliação, não quem fez a última correção.
		$physicalAssessment->update($data);

		return response()->json([
			'message' => 'Avaliação física atualizada com sucesso',
			'assessment' => $this->presentOne($physicalAssessment, $studentProfile),
		]);
	}

	public function destroy(Request $request, $student, $assessment)
	{
		$studentProfile = $this->findStudent($request, $student);

		if (!$studentProfile) {
			return response()->json(['message' => 'Aluno não encontrado'], 404);
		}

		$physicalAssessment = $studentProfile->physicalAssessments()->find($assessment);

		if (!$physicalAssessment) {
			return response()->json(['message' => 'Avaliação física não encontrada'], 404);
		}

		$physicalAssessment->delete();

		return response()->json(['message' => 'Avaliação física removida com sucesso']);
	}

	/**
	 * Nenhuma medida é obrigatória isoladamente, mas uma avaliação sem nenhuma
	 * medida não registra nada — só polui o histórico e distorce os deltas.
	 */
	private function hasNoMeasures(array $data): bool
	{
		foreach (PhysicalAssessment::MEASURE_FIELDS as $field) {
			if (($data[$field] ?? null) !== null) {
				return false;
			}
		}

		return true;
	}

	private function rules(): array
	{
		$rules = [
			'assessment_date' => ['required', 'date', 'before_or_equal:today'],
			'notes' => ['nullable', 'string'],
			'weight' => ['nullable', 'numeric', 'min:0', 'max:500'],
			'height' => ['nullable', 'numeric', 'min:0', 'max:3'],
			'fat_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
			'muscle_mass' => ['nullable', 'numeric', 'min:0', 'max:500'],
		];

		foreach (PhysicalAssessment::CIRCUMFERENCE_FIELDS as $field) {
			$rules[$field] = ['nullable', 'numeric', 'min:0', 'max:300'];
		}

		return $rules;
	}

	private function presentOne(
		PhysicalAssessment $assessment,
		StudentProfile $studentProfile,
	): PhysicalAssessmentResource {
		$assessment->setRelation('studentProfile', $studentProfile);
		$assessment->load('trainer');

		$previous = $this->previousOf($assessment, $studentProfile);
		$previous?->setRelation('studentProfile', $studentProfile);
		$assessment->previousAssessment = $previous;

		return new PhysicalAssessmentResource($assessment);
	}

	/**
	 * Avaliação imediatamente anterior a esta na linha do tempo. O desempate por
	 * id cobre duas avaliações na mesma data.
	 */
	private function previousOf(
		PhysicalAssessment $assessment,
		StudentProfile $studentProfile,
	): ?PhysicalAssessment {
		return $studentProfile->physicalAssessments()
			->where('id', '!=', $assessment->id)
			->where(function ($query) use ($assessment) {
				$query->where('assessment_date', '<', $assessment->assessment_date)
					->orWhere(function ($sameDate) use ($assessment) {
						$sameDate->where('assessment_date', $assessment->assessment_date)
							->where('id', '<', $assessment->id);
					});
			})
			->first();
	}
}
