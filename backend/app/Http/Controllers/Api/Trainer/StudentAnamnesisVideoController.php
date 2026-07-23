<?php

namespace App\Http\Controllers\Api\Trainer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Trainer\StoreStudentAnamnesisVideoRequest;
use App\Models\StudentAnamnesis;
use App\Models\StudentAnamnesisAttachment;
use App\Models\StudentProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StudentAnamnesisVideoController extends Controller
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

	public function store(StoreStudentAnamnesisVideoRequest $request, $student)
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

		$file = $request->file('video');
		$path = $file->store('anamnesis-videos', 'public');

		$video = $anamnesis->videos()->create([
			'type' => 'video',
			'path' => $path,
			'original_name' => $file->getClientOriginalName(),
			'size' => $file->getSize(),
		]);

		return response()->json([
			'message' => 'Vídeo adicionado com sucesso',
			'video' => $video,
		], 201);
	}

	public function destroy(Request $request, $student, $video)
	{
		$studentProfile = $this->scopeToTrainer(StudentProfile::query(), $request)->find($student);

		if (!$studentProfile) {
			return response()->json(['message' => 'Aluno não encontrado'], 404);
		}

		$videoModel = StudentAnamnesisAttachment::where('type', 'video')
			->whereHas('studentAnamnesis', function ($query) use ($studentProfile) {
				$query->where('student_profile_id', $studentProfile->id);
			})
			->find($video);

		if (!$videoModel) {
			return response()->json(['message' => 'Vídeo não encontrado'], 404);
		}

		Storage::disk('public')->delete($videoModel->path);
		$videoModel->delete();

		return response()->json(['message' => 'Vídeo removido com sucesso']);
	}
}
