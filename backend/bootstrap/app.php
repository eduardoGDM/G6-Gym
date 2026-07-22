<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
	->withRouting(
		web: __DIR__ . '/../routes/web.php',
		api: __DIR__ . '/../routes/api.php',
		commands: __DIR__ . '/../routes/console.php',
		health: '/up',
	)
	->withMiddleware(function (Middleware $middleware): void {
		$middleware->statefulApi();
		$middleware->throttleApi();

		$middleware->alias([
			'verified' => \App\Http\Middleware\EnsureEmailIsVerified::class,
			'role' => \App\Http\Middleware\CheckRole::class,
			'block-in-production' => \App\Http\Middleware\BlockInProduction::class,
		]);
	})
	->withExceptions(function (Exceptions $exceptions): void {
		$exceptions->shouldRenderJsonWhen(
			fn(Request $request) => $request->is('api/*')
		);

		$exceptions->render(function (ModelNotFoundException $e, Request $request) {
			if ($request->is('api/*')) {
				return response()->json([
					'message' => 'Registro não encontrado',
					'error' => 'Not Found'
				], 404);
			}
		});

		$exceptions->render(function (NotFoundHttpException $e, Request $request) {
			if ($request->is('api/*')) {
				return response()->json([
					'message' => 'Rota não encontrada',
					'error' => 'Not Found'
				], 404);
			}
		});
	})->create();
