<?php

namespace App\Http\Controllers\Api\Trainer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Trainer\StoreStudentAnamnesisPhotoRequest;
use App\Models\StudentAnamnesis;
use App\Models\StudentAnamnesisAttachment;
use App\Models\StudentProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StudentAnamnesisPhotoController extends Controller
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

	public function store(StoreStudentAnamnesisPhotoRequest $request, $student)
	{
		// Bloqueio no servidor, não só na tela: sem storage persistente o arquivo
		// seria aceito e perdido no deploy seguinte. Ver config/uploads.php.
		if (!StudentAnamnesisAttachment::uploadsEnabled()) {
			return response()->json([
				'message' => StudentAnamnesisAttachment::uploadsDisabledMessage(),
			], 503);
		}

		$studentProfile = $this->scopeToTrainer(StudentProfile::query(), $request)->find($student);

		if (!$studentProfile) {
			return response()->json(['message' => 'Aluno não encontrado'], 404);
		}

		$anamnesis = StudentAnamnesis::firstOrCreate(['student_profile_id' => $studentProfile->id]);

		$file = $request->file('photo');
		$path = $file->store('anamnesis-photos', 'public');

		$photo = $anamnesis->photos()->create([
			'type' => 'image',
			'path' => $path,
			'original_name' => $file->getClientOriginalName(),
			'size' => $file->getSize(),
		]);

		return response()->json([
			'message' => 'Foto adicionada com sucesso',
			'photo' => $photo,
		], 201);
	}

	public function destroy(Request $request, $student, $photo)
	{
		$studentProfile = $this->scopeToTrainer(StudentProfile::query(), $request)->find($student);

		if (!$studentProfile) {
			return response()->json(['message' => 'Aluno não encontrado'], 404);
		}

		$photoModel = StudentAnamnesisAttachment::where('type', 'image')
			->whereHas('studentAnamnesis', function ($query) use ($studentProfile) {
				$query->where('student_profile_id', $studentProfile->id);
			})
			->find($photo);

		if (!$photoModel) {
			return response()->json(['message' => 'Foto não encontrada'], 404);
		}

		Storage::disk('public')->delete($photoModel->path);
		$photoModel->delete();

		return response()->json(['message' => 'Foto removida com sucesso']);
	}
}
