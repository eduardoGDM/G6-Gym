<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;

class DashboardController extends Controller
{
	public function summary()
	{
		return response()->json([
			'active_trainers' => User::where('role', 'trainer')->where('is_active', true)->count(),
			'active_students' => User::where('role', 'student')->where('is_active', true)->count(),
			'total_users' => User::whereIn('role', ['trainer', 'student'])->count(),
			'registrations_today' => User::whereIn('role', ['trainer', 'student'])
				->whereDate('created_at', today())
				->count(),
		]);
	}
}
