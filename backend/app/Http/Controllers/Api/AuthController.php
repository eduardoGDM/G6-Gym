<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class AuthController extends Controller
{
	private const MAX_LOGIN_ATTEMPTS = 5;
	private const LOGIN_DECAY_SECONDS = 60;

	public function login(Request $request)
	{
		$credentials = $request->validate([
			'email' => 'required|email',
			'password' => 'required',
		]);

		$throttleKey = Str::lower($credentials['email']) . '|' . $request->ip();

		if (RateLimiter::tooManyAttempts($throttleKey, self::MAX_LOGIN_ATTEMPTS)) {
			return response()->json([
				'message' => 'Muitas tentativas de login. Tente novamente em ' . RateLimiter::availableIn($throttleKey) . ' segundos.'
			], 429);
		}

		if (!Auth::attempt($credentials)) {
			RateLimiter::hit($throttleKey, self::LOGIN_DECAY_SECONDS);

			return response()->json([
				'message' => 'Credenciais inválidas'
			], 401);
		}

		RateLimiter::clear($throttleKey);

		$request->session()->regenerate();

		$user = Auth::user();

		if (!$user->is_active) {
			Auth::guard('web')->logout();
			$request->session()->invalidate();
			$request->session()->regenerateToken();

			return response()->json([
				'message' => 'Sua conta encontra-se desativada. Entre em contato com o administrador da plataforma.'
			], 403);
		}

		return response()->json([
			'user' => $user,
			'message' => 'Login realizado com sucesso'
		]);
	}

	public function logout(Request $request)
	{
		Auth::guard('web')->logout();

		$request->session()->invalidate();
		$request->session()->regenerateToken();

		return response()->json([
			'message' => 'Logout realizado com sucesso'
		]);
	}

	public function me(Request $request)
	{
		return response()->json($request->user());
	}
}
