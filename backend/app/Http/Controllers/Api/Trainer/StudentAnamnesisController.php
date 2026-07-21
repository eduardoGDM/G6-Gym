<?php

namespace App\Http\Controllers\Api\Trainer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Trainer\UpdateStudentAnamnesisRequest;
use App\Models\StudentAnamnesis;
use App\Models\StudentProfile;

class StudentAnamnesisController extends Controller
{
	public function show($student)
	{
		$studentProfile = StudentProfile::with(['anamnesis.photos', 'anamnesis.videos'])->find($student);

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
		$studentProfile = StudentProfile::find($student);

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
