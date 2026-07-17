<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Trainer\StudentProfileController;
use App\Http\Controllers\Api\Trainer\WorkoutController;
use App\Http\Controllers\Api\Trainer\ExerciseController;
use App\Http\Controllers\Api\Trainer\WorkoutExerciseController;
use App\Http\Controllers\Api\Trainer\MuscleGroupController;
use App\Http\Controllers\Api\Student\WorkoutController as StudentWorkoutController;
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
			Route::apiResource('student-profiles', StudentProfileController::class);
			Route::apiResource('workouts', WorkoutController::class);
			Route::apiResource('exercises', ExerciseController::class);
			Route::apiResource('workout-exercises', WorkoutExerciseController::class);
			Route::get('muscle-groups', [MuscleGroupController::class, 'index']);
		});

	Route::prefix('student')
		->middleware('role:student')
		->group(function () {
			Route::get('/my-workouts', [StudentWorkoutController::class, 'index']);
			Route::get('/workout/{id}', [StudentWorkoutController::class, 'show']);
		});
});
