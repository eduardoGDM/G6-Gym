<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UsersSeeder extends Seeder
{
	public function run(): void
	{
		User::create([
			'name' => 'Personal Teste',
			'email' => 'persona@teste.com',
			'password' => Hash::make('123456'),
			'role' => 'trainer',
		]);

		User::create([
			'name' => 'Aluno Teste',
			'email' => 'student@teste.com',
			'password' => Hash::make('123456'),
			'role' => 'student',
		]);

		User::create([
			'name' => 'Admin G6Fit',
			'email' => 'admin@teste.com',
			'password' => Hash::make('123456'),
			'role' => 'admin',
		]);
	}
}
