<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

use App\Models\User;
use App\Models\PerfilAluno;
use App\Models\GrupoMuscular;
use App\Models\Exercicio;
use App\Models\Treino;
use App\Models\TreinoExercicio;

class SuperSeeder extends Seeder
{
	public function run(): void
	{
		// ======================
		// USERS
		// ======================

		$personal = User::create([
			'name' => 'Personal Teste',
			'email' => 'personal@teste.com',
			'password' => Hash::make('123456'),
			'role' => 'personal',
		]);

		$aluno = User::create([
			'name' => 'Aluno Teste',
			'email' => 'aluno@teste.com',
			'password' => Hash::make('123456'),
			'role' => 'aluno',
		]);

		// ======================
		// PERFIL ALUNO
		// ======================

		$perfil = PerfilAluno::create([
			'user_id' => $aluno->id,
			'cpf' => '123.456.789-00',
			'telefone' => '41999999999',
			'data_nascimento' => '2000-01-01',
			'sexo' => 'Masculino',
			'altura' => 1.80,
			'peso_atual' => 80.5,
			'observacoes' => 'Aluno de teste',
		]);

		// ======================
		// GRUPOS MUSCULARES
		// ======================

		$peito = GrupoMuscular::create([
			'nome' => 'Peito',
		]);

		$perna = GrupoMuscular::create([
			'nome' => 'Pernas',
		]);

		// ======================
		// EXERCÍCIOS
		// ======================

		$supino = Exercicio::create([
			'grupo_muscular_id' => $peito->id,
			'nome' => 'Supino Reto',
			'descricao' => 'Exercício de peitoral',
			'equipamento' => 'Barra',
			'video_url' => null,
		]);

		$agachamento = Exercicio::create([
			'grupo_muscular_id' => $perna->id,
			'nome' => 'Agachamento Livre',
			'descricao' => 'Exercício de pernas',
			'equipamento' => 'Barra',
			'video_url' => null,
		]);

		// ======================
		// TREINO
		// ======================

		$treino = Treino::create([
			'perfil_aluno_id' => $perfil->id,
			'personal_id' => $personal->id,
			'nome' => 'Treino A',
			'descricao' => 'Treino de força iniciante',
			'data_inicio' => now(),
			'data_fim' => null,
			'ativo' => true,
		]);

		// ======================
		// TREINO EXERCICIOS
		// ======================

		TreinoExercicio::create([
			'treino_id' => $treino->id,
			'exercicio_id' => $supino->id,
			'metodo_treino_id' => null,
			'ordem' => 1,
			'series_aquecimento' => 2,
			'series_reconhecimento' => 1,
			'series_validas' => 3,
			'repeticoes' => '10-12',
			'rir' => 2,
			'descanso_segundos' => 60,
			'cadencia' => '2-1-2',
			'carga' => 40,
			'observacoes' => 'Foco em execução perfeita',
		]);

		TreinoExercicio::create([
			'treino_id' => $treino->id,
			'exercicio_id' => $agachamento->id,
			'metodo_treino_id' => null,
			'ordem' => 2,
			'series_aquecimento' => 2,
			'series_reconhecimento' => 1,
			'series_validas' => 4,
			'repeticoes' => '8-10',
			'rir' => 1,
			'descanso_segundos' => 90,
			'cadencia' => '3-1-1',
			'carga' => 60,
			'observacoes' => 'Controle de profundidade',
		]);
	}
}
