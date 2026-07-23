<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Http\Resources\PhysicalAssessmentResource;
use Illuminate\Http\Request;

/**
 * Perfil do próprio aluno: dados cadastrais e histórico de avaliações físicas.
 *
 * A tela é somente leitura — o cadastro é responsabilidade do personal, que é
 * quem responde pelos dados do aluno.
 */
class ProfileController extends Controller
{
	private function resolveProfile(Request $request)
	{
		return $request->user()->studentProfile;
	}

	public function show(Request $request)
	{
		$profile = $this->resolveProfile($request);

		if (!$profile) {
			return response()->json([
				'message' => 'Perfil de student não encontrado'
			], 404);
		}

		$profile->load('trainer');

		// Peso atual não é campo do cadastro: é o da avaliação mais recente que
		// registrou peso (uma avaliação pode ter só circunferências).
		$latestWeighed = $profile->physicalAssessments()->whereNotNull('weight')->first();

		return response()->json([
			'id' => $profile->id,
			'name' => $request->user()->name,
			'email' => $request->user()->email,
			'cpf' => $profile->cpf,
			'phone' => $profile->phone,
			'birth_date' => $profile->birth_date?->format('Y-m-d'),
			'gender' => $profile->gender,
			'height' => $profile->height,
			'latest_weight' => $latestWeighed?->weight,
			'latest_weight_date' => $latestWeighed?->assessment_date?->format('Y-m-d'),
			'trainer' => $profile->trainer ? [
				'id' => $profile->trainer->id,
				'name' => $profile->trainer->name,
			] : null,
		]);
	}

	public function physicalAssessments(Request $request)
	{
		$profile = $this->resolveProfile($request);

		if (!$profile) {
			return response()->json([
				'message' => 'Perfil de student não encontrado'
			], 404);
		}

		$assessments = $profile->physicalAssessments()->with('trainer')->get();

		return PhysicalAssessmentResource::collection(
			PhysicalAssessmentResource::withComparisonContext($assessments, $profile),
		);
	}
}
