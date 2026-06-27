<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PerfilAlunoController;
use App\Http\Controllers\Api\TreinoController;
use App\Http\Controllers\Api\ExercicioController;
use App\Http\Controllers\Api\TreinoExercicioController;

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

	Route::prefix('personal')
		->middleware('role:personal')
		->group(function () {

			Route::apiResource('perfil-alunos', PerfilAlunoController::class);
			Route::apiResource('treinos', TreinoController::class);
			Route::apiResource('exercicios', ExercicioController::class);
			Route::apiResource('treino-exercicios', TreinoExercicioController::class);
		});

	Route::prefix('aluno')
		->middleware(['auth:sanctum', 'role:aluno'])
		->group(function () {

			Route::get('/meus-treinos', [\App\Http\Controllers\Api\Aluno\AlunoTreinoController::class, 'index']);

			Route::get('/treino/{id}', [\App\Http\Controllers\Api\Aluno\AlunoTreinoController::class, 'show']);

			// depois entra aqui:
			// Route::post('/execucao-exercicio', [AlunoTreinoExercicioController::class, 'store']);
			// Route::put('/execucao-exercicio/{id}', [AlunoTreinoExercicioController::class, 'update']);
		});
});
