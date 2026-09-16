<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

use App\Models\Exercise;
use App\Models\MuscleGroup;
use App\Models\User;
use App\Models\Workout;

/**
 * Treinos de exemplo (divisão ABCD) para um aluno já existente.
 *
 * Uso: php artisan db:seed --class=StudentExampleWorkoutsSeeder
 * E-mail alvo configurável via STUDENT_EXAMPLE_EMAIL (padrão dudu@gmail.com).
 *
 * Idempotente: remove os treinos de exemplo com os mesmos nomes antes de recriar.
 */
class StudentExampleWorkoutsSeeder extends Seeder
{
	public function run(): void
	{
		$email = env('STUDENT_EXAMPLE_EMAIL', 'dudu@gmail.com');

		$student = User::with('studentProfile')->where('email', $email)->first();

		if (!$student || !$student->studentProfile) {
			$this->command?->error("Aluno {$email} não encontrado ou sem perfil de aluno.");
			return;
		}

		$profile = $student->studentProfile;

		if (!$profile->trainer_id) {
			$this->command?->error("Aluno {$email} não está vinculado a um personal.");
			return;
		}

		$exercises = Exercise::pluck('id', 'name');
		$muscleGroups = MuscleGroup::pluck('id', 'name');

		DB::transaction(function () use ($profile, $exercises, $muscleGroups) {
			foreach ($this->workouts() as $data) {
				Workout::where('student_profile_id', $profile->id)
					->where('name', $data['name'])
					->get()
					->each(function (Workout $workout) {
						$workout->muscleGroups()->detach();
						$workout->delete();
					});

				$workout = Workout::create([
					'student_profile_id' => $profile->id,
					'trainer_id' => $profile->trainer_id,
					'created_by' => $profile->trainer_id,
					'name' => $data['name'],
					'description' => $data['description'],
					'start_date' => now()->startOfWeek(),
					'end_date' => now()->startOfWeek()->addWeeks(8),
					'active' => true,
				]);

				$workout->muscleGroups()->sync(
					collect($data['muscle_groups'])->map(fn ($name) => $muscleGroups[$name] ?? null)->filter()->values()
				);

				foreach ($data['exercises'] as $index => [$name, $notes, $series]) {
					if (!isset($exercises[$name])) {
						$this->command?->warn("Exercício \"{$name}\" não encontrado, ignorado.");
						continue;
					}

					$workoutExercise = $workout->workoutExercises()->create([
						'exercise_id' => $exercises[$name],
						'order' => $index + 1,
						'notes' => $notes,
					]);

					foreach ($series as $order => $serie) {
						$workoutExercise->series()->create($serie + ['order' => $order + 1]);
					}
				}

				$this->command?->info("Treino \"{$data['name']}\" criado.");
			}
		});
	}

	/**
	 * Séries padrão: aquecimento + N válidas, a última até a falha.
	 */
	private function series(string $reps, ?float $weight, int $rest, int $valid = 3, bool $warmup = true): array
	{
		$series = [];

		if ($warmup) {
			$series[] = [
				'repetitions' => '15',
				'weight' => $weight === null ? null : round($weight * 0.5, 1),
				'rest_time' => 45,
				'rir' => '5',
				'type' => 'Aquecimento',
			];
		}

		for ($i = 1; $i <= $valid; $i++) {
			$series[] = [
				'repetitions' => $reps,
				'weight' => $weight,
				'rest_time' => $rest,
				'rir' => $i === $valid ? 'FALHA' : '2',
				'type' => 'Válida',
				'cadence' => '2s exc / 1s conc',
			];
		}

		return $series;
	}

	private function workouts(): array
	{
		return [
			[
				'name' => 'Treino A - Peito e Tríceps',
				'description' => 'Foco em empurrar: peitoral e tríceps.',
				'muscle_groups' => ['Peito', 'Tríceps'],
				'exercises' => [
					['Supino reto com barra', 'Escápulas retraídas durante todo o movimento.', $this->series('8-10', 50, 90)],
					['Supino inclinado com halteres', null, $this->series('10-12', 20, 75, 3, false)],
					['Crucifixo', 'Amplitude controlada, sem estender demais o ombro.', $this->series('12', 12, 60, 3, false)],
					['Crossover', null, [
						['repetitions' => '12', 'weight' => 15, 'rest_time' => 60, 'rir' => '1', 'type' => 'Válida'],
						['repetitions' => '12', 'weight' => 15, 'rest_time' => 60, 'rir' => '0', 'type' => 'Válida', 'advanced_technique' => 'Drop Set', 'notes' => 'Reduzir 30% da carga e seguir até a falha.'],
					]],
					['Tríceps pulley', null, $this->series('12-15', 25, 60, 3, false)],
					['Tríceps francês', null, $this->series('10-12', 12, 60, 3, false)],
				],
			],
			[
				'name' => 'Treino B - Costas e Bíceps',
				'description' => 'Foco em puxar: dorsais e bíceps.',
				'muscle_groups' => ['Costas', 'Bíceps'],
				'exercises' => [
					['Puxada frontal', 'Levar a barra até a parte alta do peito.', $this->series('10-12', 45, 90)],
					['Remada curvada', 'Tronco a ~45°, coluna neutra.', $this->series('8-10', 40, 90, 3, false)],
					['Remada baixa', null, $this->series('10-12', 50, 75, 3, false)],
					['Barra fixa', 'Se necessário, usar elástico de assistência.', [
						['repetitions' => 'máx', 'rest_time' => 120, 'rir' => 'FALHA', 'type' => 'Válida'],
						['repetitions' => 'máx', 'rest_time' => 120, 'rir' => 'FALHA', 'type' => 'Válida'],
					]],
					['Rosca direta', null, $this->series('10-12', 25, 60, 3, false)],
					['Rosca martelo', null, $this->series('12', 12, 60, 3, false)],
				],
			],
			[
				'name' => 'Treino C - Pernas',
				'description' => 'Quadríceps, posteriores, glúteos e panturrilhas.',
				'muscle_groups' => ['Pernas', 'Panturrilhas'],
				'exercises' => [
					['Agachamento livre', 'Descer até a coxa paralela ao chão.', $this->series('8', 60, 120, 4)],
					['Leg press', null, $this->series('10-12', 150, 90, 3, false)],
					['Cadeira extensora', null, [
						['repetitions' => '12', 'weight' => 40, 'rest_time' => 60, 'rir' => '2', 'type' => 'Válida'],
						['repetitions' => '12', 'weight' => 40, 'rest_time' => 60, 'rir' => '1', 'type' => 'Válida'],
						['repetitions' => '12', 'weight' => 40, 'rest_time' => 60, 'rir' => '0', 'type' => 'Válida', 'advanced_technique' => 'Parciais', 'notes' => 'Após a falha, parciais na metade final.'],
					]],
					['Mesa flexora', null, $this->series('10-12', 35, 60, 3, false)],
					['Stiff', 'Joelhos levemente flexionados.', $this->series('10', 40, 90, 3, false)],
					['Panturrilha em pé', null, $this->series('15-20', 60, 45, 4, false)],
				],
			],
			[
				'name' => 'Treino D - Ombros e Abdômen',
				'description' => 'Deltoides e core.',
				'muscle_groups' => ['Ombros', 'Abdômen'],
				'exercises' => [
					['Desenvolvimento com barra', null, $this->series('8-10', 30, 90)],
					['Elevação lateral', 'Subir até a linha dos ombros.', $this->series('12-15', 8, 60, 4, false)],
					['Elevação frontal', null, $this->series('12', 8, 60, 3, false)],
					['Crucifixo inverso', null, $this->series('15', 6, 60, 3, false)],
					['Abdominal reto', null, $this->series('20', null, 45, 3, false)],
					['Prancha', 'Manter quadril alinhado.', [
						['duration' => 45, 'rest_time' => 45, 'type' => 'Válida'],
						['duration' => 45, 'rest_time' => 45, 'type' => 'Válida'],
						['duration' => 60, 'rest_time' => 45, 'type' => 'Válida'],
					]],
				],
			],
		];
	}
}
