<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
	public function up(): void
	{
		// Update user roles from Portuguese to English
		DB::table('users')->where('role', 'trainer')->update(['role' => 'trainer']);
		DB::table('users')->where('role', 'student')->update(['role' => 'student']);
	}

	public function down(): void
	{
		// Revert user roles from English to Portuguese
		DB::table('users')->where('role', 'trainer')->update(['role' => 'trainer']);
		DB::table('users')->where('role', 'student')->update(['role' => 'student']);
	}
};
