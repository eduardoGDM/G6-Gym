<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Trainer\StudentProfileController;
use App\Http\Controllers\Api\Trainer\WorkoutController;
use App\Http\Controllers\Api\Trainer\ExerciseController;
use App\Http\Controllers\Api\Trainer\WorkoutExerciseController;
use App\Http\Controllers\Api\Student\WorkoutController as StudentWorkoutController;

Route::prefix('auth')->group(function () {
	Route::post('/login', [AuthController::class, 'login']);
});


Route::middleware('auth:sanctum')->group(function () {

	Route::prefix('auth')->group(function () {
		Route::get('/me', function (Request $request) {
			return $request->user();
		});

		Route::post('/logout', [AuthController::class, 'logout']);
	});

	Route::prefix('trainer')
		->middleware('role:trainer')
		->group(function () {

			Route::apiResource('student-profiles', StudentProfileController::class);
			Route::apiResource('workouts', WorkoutController::class);
			Route::apiResource('exercises', ExerciseController::class);
			Route::apiResource('workout-exercises', WorkoutExerciseController::class);
		});

	Route::prefix('student')
		->middleware(['auth:sanctum', 'role:student'])
		->group(function () {

			Route::get('/my-workouts', [StudentWorkoutController::class, 'index']);

			Route::get('/workout/{id}', [StudentWorkoutController::class, 'show']);

			// depois entra aqui:
			// Route::post('/exercise-execution', [StudentWorkoutExerciseController::class, 'store']);
			// Route::put('/exercise-execution/{id}', [StudentWorkoutExerciseController::class, 'update']);
		});
});
