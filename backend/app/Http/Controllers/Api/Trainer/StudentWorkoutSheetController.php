<?php

namespace App\Http\Controllers\Api\Trainer;

use App\Http\Controllers\Concerns\ManagesWorkouts;
use App\Http\Controllers\Controller;
use App\Models\StudentProfile;
use Illuminate\Http\Request;

class StudentWorkoutSheetController extends Controller
{
    use ManagesWorkouts;

    public function show(Request $request, $student)
    {
        $studentProfile = StudentProfile::with('user')->find($student);

        if (!$studentProfile) {
            return response()->json([
                'message' => 'Aluno não encontrado',
            ], 404);
        }

        $trainer = $request->user();

        $isLinkedToTrainer = (int) $studentProfile->trainer_id === (int) $trainer->id;

        if (!$isLinkedToTrainer) {
            return response()->json([
                'message' => 'Acesso não autorizado',
            ], 403);
        }

        return $this->workoutSheetDownload($studentProfile, $trainer);
    }
}
