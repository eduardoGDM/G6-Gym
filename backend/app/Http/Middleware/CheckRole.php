<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
	public function handle(Request $request, Closure $next, ...$roles)
	{
		$user = $request->user();

		if (!$user || !in_array($user->role, $roles)) {
			return response()->json([
				'message' => 'Acesso não autorizado'
			], 403);
		}

		// Revalida o status da conta a cada requisição: uma conta desativada pelo
		// admin (ou um aluno removido pelo trainer) é bloqueada imediatamente,
		// sem depender da expiração da sessão.
		if (!$user->is_active) {
			return response()->json([
				'message' => 'Sua conta encontra-se desativada. Entre em contato com o administrador da plataforma.',
				'code' => 'ACCOUNT_INACTIVE',
			], 403);
		}

		return $next($request);
	}
}
