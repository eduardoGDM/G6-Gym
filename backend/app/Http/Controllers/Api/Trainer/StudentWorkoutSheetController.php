<?php

namespace App\Http\Controllers\Api\Trainer;

use App\Http\Controllers\Controller;
use App\Models\StudentProfile;
use App\Models\Workout;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class StudentWorkoutSheetController extends Controller
{
    public function show(Request $request, $student)
    {
        $studentProfile = StudentProfile::with('user')->find($student);

        if (!$studentProfile) {
            return response()->json([
                'message' => 'Aluno não encontrado',
            ], 404);
        }

        $trainer = $request->user();

        $isLinkedToTrainer = Workout::where('student_profile_id', $studentProfile->id)
            ->where('trainer_id', $trainer->id)
            ->exists();

        if (!$isLinkedToTrainer) {
            return response()->json([
                'message' => 'Acesso não autorizado',
            ], 403);
        }

        $workouts = Workout::with([
            'muscleGroups',
            'workoutExercises' => function ($query) {
                $query->orderBy('order');
            },
            'workoutExercises.exercise.muscleGroup',
            'workoutExercises.series',
        ])
            ->where('student_profile_id', $studentProfile->id)
            ->where('trainer_id', $trainer->id)
            ->where('active', true)
            ->orderBy('name')
            ->get();

        $pdf = Pdf::loadView('pdf.workout-sheet', [
            'student' => $studentProfile,
            'workouts' => $workouts,
            'trainer' => $trainer,
            'generatedAt' => now(),
        ]);

        $fileName = 'ficha-treino-' . str($studentProfile->user->name)->slug() . '.pdf';

        return $pdf->download($fileName);
    }
}
