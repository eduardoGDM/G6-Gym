<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Bloqueia o acesso a rotas de ferramentas de desenvolvimento (ex.: Swagger UI)
 * quando a aplicação está em produção.
 *
 * Devolve 404 (e não 403) de propósito: em produção a rota deve se comportar
 * como se não existisse, sem revelar a presença da ferramenta.
 */
class BlockInProduction
{
	public function handle(Request $request, Closure $next)
	{
		if (app()->environment('production')) {
			throw new NotFoundHttpException();
		}

		return $next($request);
	}
}
