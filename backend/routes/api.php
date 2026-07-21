<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Trainer\StudentProfileController;
use App\Http\Controllers\Api\Trainer\WorkoutController;
use App\Http\Controllers\Api\Trainer\ExerciseController;
use App\Http\Controllers\Api\Trainer\WorkoutExerciseController;
use App\Http\Controllers\Api\Trainer\MuscleGroupController;
use App\Http\Controllers\Api\Trainer\StudentWorkoutSheetController;
use App\Http\Controllers\Api\Trainer\StudentExerciseEvolutionController;
use App\Http\Controllers\Api\Trainer\StudentAnamnesisController;
use App\Http\Controllers\Api\Trainer\StudentAnamnesisPhotoController;
use App\Http\Controllers\Api\Trainer\StudentAnamnesisVideoController;
use App\Http\Controllers\Api\Trainer\WorkoutCheckinController as TrainerWorkoutCheckinController;
use App\Http\Controllers\Api\Trainer\DailyCheckinController as TrainerDailyCheckinController;
use App\Http\Controllers\Api\Trainer\DashboardController as TrainerDashboardController;
use App\Http\Controllers\Api\Student\WorkoutController as StudentWorkoutController;
use App\Http\Controllers\Api\Student\WorkoutCheckinController;
use App\Http\Controllers\Api\Student\DailyCheckinController;
use App\Http\Controllers\Api\Student\DashboardController as StudentDashboardController;
use App\Http\Controllers\Api\Student\GamificationController as StudentGamificationController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\TrainerController as AdminTrainerController;
use App\Http\Controllers\Api\Admin\StudentController as AdminStudentController;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;

Route::prefix('auth')->group(function () {
	Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware('auth:sanctum')->group(function () {

	Route::prefix('auth')->group(function () {
		Route::get('/user', [AuthController::class, 'me']);
		Route::post('/logout', [AuthController::class, 'logout']);
	});

	Route::prefix('trainer')
		->middleware('role:trainer')
		->group(function () {
			Route::get('dashboard/summary', [TrainerDashboardController::class, 'summary']);
			Route::get('dashboard/recent-workout-checkins', [TrainerDashboardController::class, 'recentWorkoutCheckins']);
			Route::get('dashboard/recent-daily-checkins', [TrainerDashboardController::class, 'recentDailyCheckins']);
			Route::get('dashboard/pending-daily-checkins', [TrainerDashboardController::class, 'pendingDailyCheckins']);

			Route::apiResource('student-profiles', StudentProfileController::class);
			Route::apiResource('workouts', WorkoutController::class);
			Route::apiResource('exercises', ExerciseController::class);
			Route::apiResource('workout-exercises', WorkoutExerciseController::class);
			Route::get('muscle-groups', [MuscleGroupController::class, 'index']);
			Route::get('students/{student}/workout-sheet', [StudentWorkoutSheetController::class, 'show']);
			Route::get('students/{student}/checkins/muscle-groups', [StudentExerciseEvolutionController::class, 'muscleGroups']);
			Route::get('students/{student}/checkins/exercises', [StudentExerciseEvolutionController::class, 'exercises']);
			Route::get('students/{student}/exercises/{exercise}/evolution', [StudentExerciseEvolutionController::class, 'show']);

			Route::get('checkins/students', [TrainerWorkoutCheckinController::class, 'students']);
			Route::get('checkins/{id}', [TrainerWorkoutCheckinController::class, 'show']);
			Route::get('checkins', [TrainerWorkoutCheckinController::class, 'index']);

			Route::get('daily-checkins/{id}', [TrainerDailyCheckinController::class, 'show']);
			Route::get('daily-checkins', [TrainerDailyCheckinController::class, 'index']);
		});

	Route::prefix('trainer')
		->middleware('role:trainer,admin')
		->group(function () {
			Route::get('students/{student}/anamnesis', [StudentAnamnesisController::class, 'show']);
			Route::put('students/{student}/anamnesis', [StudentAnamnesisController::class, 'update']);

			Route::post('students/{student}/anamnesis/photos', [StudentAnamnesisPhotoController::class, 'store']);
			Route::delete('students/{student}/anamnesis/photos/{photo}', [StudentAnamnesisPhotoController::class, 'destroy']);

			Route::post('students/{student}/anamnesis/videos', [StudentAnamnesisVideoController::class, 'store']);
			Route::delete('students/{student}/anamnesis/videos/{video}', [StudentAnamnesisVideoController::class, 'destroy']);
		});

	Route::prefix('student')
		->middleware('role:student')
		->group(function () {
			Route::get('/dashboard/summary', [StudentDashboardController::class, 'summary']);
			Route::get('/dashboard/recent-workouts', [StudentDashboardController::class, 'recentWorkouts']);
			Route::get('/dashboard/evolution', [StudentDashboardController::class, 'evolution']);

			Route::get('/gamification/summary', [StudentGamificationController::class, 'summary']);

			Route::get('/my-workouts', [StudentWorkoutController::class, 'index']);
			Route::get('/workout/{id}', [StudentWorkoutController::class, 'show']);

			Route::get('/checkins', [WorkoutCheckinController::class, 'index']);
			Route::get('/checkins/by-date', [WorkoutCheckinController::class, 'byDate']);
			Route::get('/checkins/{id}', [WorkoutCheckinController::class, 'show']);
			Route::post('/checkins', [WorkoutCheckinController::class, 'store']);
			Route::put('/checkins/{id}', [WorkoutCheckinController::class, 'update']);

			Route::get('/daily-checkins/reminder', [DailyCheckinController::class, 'reminder']);
			Route::get('/daily-checkins', [DailyCheckinController::class, 'index']);
			Route::post('/daily-checkins', [DailyCheckinController::class, 'store']);
			Route::put('/daily-checkins/{id}', [DailyCheckinController::class, 'update']);
		});

	Route::prefix('admin')
		->middleware('role:admin')
		->group(function () {
			Route::get('dashboard/summary', [AdminDashboardController::class, 'summary']);

			Route::get('trainers', [AdminTrainerController::class, 'index']);
			Route::patch('trainers/{id}/status', [AdminTrainerController::class, 'updateStatus']);

			Route::get('students', [AdminStudentController::class, 'index']);
			Route::patch('students/{id}/status', [AdminStudentController::class, 'updateStatus']);
		});
});
