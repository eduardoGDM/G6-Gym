<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
	public function login(Request $request)
	{
		$credentials = $request->validate([
			'email' => 'required|email',
			'password' => 'required',
		]);

		if (!Auth::attempt($credentials)) {
			return response()->json([
				'message' => 'Credenciais inválidas'
			], 401);
		}

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
