<?php

namespace App\Http\Controllers\Api\Trainer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Trainer\UpdateStudentAnamnesisRequest;
use App\Models\StudentAnamnesis;
use App\Models\StudentProfile;
use Illuminate\Http\Request;

class StudentAnamnesisController extends Controller
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

	public function show(Request $request, $student)
	{
		$studentProfile = $this->scopeToTrainer(
			StudentProfile::with(['anamnesis.photos', 'anamnesis.videos']),
			$request,
		)->find($student);

		if (!$studentProfile) {
			return response()->json(['message' => 'Aluno não encontrado'], 404);
		}

		$anamnesis = $studentProfile->anamnesis;

		return response()->json([
			'id' => $anamnesis?->id,
			'student_profile_id' => $studentProfile->id,
			'observations' => $anamnesis?->observations,
			'photos' => $anamnesis?->photos ?? [],
			'videos' => $anamnesis?->videos ?? [],
		]);
	}

	public function update(UpdateStudentAnamnesisRequest $request, $student)
	{
		$studentProfile = $this->scopeToTrainer(StudentProfile::query(), $request)->find($student);

		if (!$studentProfile) {
			return response()->json(['message' => 'Aluno não encontrado'], 404);
		}

		$anamnesis = StudentAnamnesis::firstOrCreate(['student_profile_id' => $studentProfile->id]);
		$anamnesis->update($request->validated());

		return response()->json([
			'message' => 'Anamnese atualizada com sucesso',
			'anamnesis' => $anamnesis,
		]);
	}
}
