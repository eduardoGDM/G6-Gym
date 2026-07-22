<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\StudentProfile;

class UsersSeeder extends Seeder
{
	public function run(): void
	{
		// Personal (trainer)
		$trainer = User::create([
			'name' => 'Personal Teste',
			'email' => 'personal@teste.com',
			'password' => Hash::make('123456'),
			'role' => 'trainer',
			'is_active' => true,
		]);

		// Aluno de teste
		$student = User::create([
			'name' => 'Aluno Teste',
			'email' => 'student@teste.com',
			'password' => Hash::make('123456'),
			'role' => 'student',
			'is_active' => true,
		]);

		// Vincula o aluno ao personal criado acima.
		StudentProfile::create([
			'user_id' => $student->id,
			'trainer_id' => $trainer->id,
			'cpf' => '000.000.000-00',
		]);

		// Admin
		User::create([
			'name' => 'Admin G6Fit',
			'email' => 'admin@teste.com',
			'password' => Hash::make('123456'),
			'role' => 'admin',
			'is_active' => true,
		]);
	}
}
