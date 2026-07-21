<?php

namespace Database\Seeders;

use App\Models\Exercise;
use App\Models\MuscleGroup;
use Illuminate\Database\Seeder;

class ExerciseSeeder extends Seeder
{
	public function run(): void
	{
		$exercises = [
			'Peito' => [
				[
					'name' => 'Supino reto com barra',
					'description' => 'Exercício básico para peitoral. Deitado no banco, desça a barra até tocar levemente o peito e empurre para cima até estender os braços.',
					'equipment' => 'Barra',
				],
				[
					'name' => 'Supino inclinado com halteres',
					'description' => 'Foca na porção superior do peitoral. No banco inclinado, empurre os halteres para cima até quase estender os cotovelos e desça de forma controlada.',
					'equipment' => 'Halteres',
				],
				[
					'name' => 'Crucifixo',
					'description' => 'Isola o peitoral. Com os braços levemente flexionados, abra os halteres em arco até a altura do peito e retorne à posição inicial.',
					'equipment' => 'Halteres',
				],
				[
					'name' => 'Crossover',
					'description' => 'Trabalha o peitoral com tensão constante. Puxe os cabos em direção ao centro do corpo em movimento de arco, contraindo o peito no final.',
					'equipment' => 'Cabo',
				],
			],
			'Costas' => [
				[
					'name' => 'Barra fixa',
					'description' => 'Exercício composto para as costas. Pendurado na barra, puxe o corpo para cima até o queixo ultrapassar a barra e desça controladamente.',
					'equipment' => 'Peso corporal',
				],
				[
					'name' => 'Puxada frontal',
					'description' => 'Alternativa à barra fixa. Puxe a barra em direção à parte superior do peito, contraindo as escápulas, e retorne de forma controlada.',
					'equipment' => 'Polia',
				],
				[
					'name' => 'Remada curvada',
					'description' => 'Fortalece a musculatura dorsal. Com o tronco inclinado à frente, puxe a barra em direção ao abdômen mantendo a coluna neutra.',
					'equipment' => 'Barra',
				],
				[
					'name' => 'Remada baixa',
					'description' => 'Trabalha as costas em posição sentada. Puxe o cabo em direção ao abdômen mantendo o tronco ereto e retorne sem perder a postura.',
					'equipment' => 'Cabo',
				],
			],
			'Ombros' => [
				[
					'name' => 'Desenvolvimento com barra',
					'description' => 'Exercício composto para os ombros. Empurre a barra para cima a partir da altura dos ombros até estender os braços.',
					'equipment' => 'Barra',
				],
				[
					'name' => 'Elevação lateral',
					'description' => 'Isola o deltoide lateral. Eleve os halteres para os lados até a altura dos ombros, mantendo leve flexão nos cotovelos.',
					'equipment' => 'Halteres',
				],
				[
					'name' => 'Elevação frontal',
					'description' => 'Isola o deltoide anterior. Eleve os halteres à frente do corpo até a altura dos ombros e desça de forma controlada.',
					'equipment' => 'Halteres',
				],
				[
					'name' => 'Crucifixo inverso',
					'description' => 'Trabalha o deltoide posterior. Com o tronco inclinado à frente, abra os halteres para os lados contraindo a parte de trás dos ombros.',
					'equipment' => 'Halteres',
				],
			],
			'Bíceps' => [
				[
					'name' => 'Rosca direta',
					'description' => 'Exercício básico para bíceps. Com a barra na frente do corpo, flexione os cotovelos até a altura dos ombros e desça controladamente.',
					'equipment' => 'Barra',
				],
				[
					'name' => 'Rosca alternada',
					'description' => 'Trabalha o bíceps unilateralmente. Flexione um braço por vez levando o halter até a altura do ombro, alternando os lados.',
					'equipment' => 'Halteres',
				],
				[
					'name' => 'Rosca martelo',
					'description' => 'Enfatiza o bíceps e o antebraço. Com os halteres em pegada neutra, flexione os cotovelos sem girar os punhos.',
					'equipment' => 'Halteres',
				],
			],
			'Tríceps' => [
				[
					'name' => 'Tríceps pulley',
					'description' => 'Exercício básico para tríceps. Com os cotovelos fixos ao lado do corpo, estenda os braços empurrando a barra para baixo.',
					'equipment' => 'Polia',
				],
				[
					'name' => 'Tríceps francês',
					'description' => 'Isola o tríceps. Com o halter atrás da cabeça, estenda os braços para cima mantendo os cotovelos apontados para frente.',
					'equipment' => 'Halteres',
				],
				[
					'name' => 'Tríceps testa',
					'description' => 'Deitado no banco, desça a barra em direção à testa flexionando os cotovelos e estenda os braços de volta.',
					'equipment' => 'Barra',
				],
			],
			'Pernas' => [
				[
					'name' => 'Agachamento livre',
					'description' => 'Exercício composto para pernas. Com a barra apoiada nas costas, flexione os joelhos até a coxa ficar paralela ao chão e retorne à posição inicial.',
					'equipment' => 'Barra',
				],
				[
					'name' => 'Leg press',
					'description' => 'Trabalha quadríceps e glúteos com segurança. Empurre a plataforma estendendo as pernas sem travar os joelhos completamente.',
					'equipment' => 'Máquina',
				],
				[
					'name' => 'Cadeira extensora',
					'description' => 'Isola o quadríceps. Sentado na máquina, estenda os joelhos elevando o peso e desça de forma controlada.',
					'equipment' => 'Máquina',
				],
				[
					'name' => 'Mesa flexora',
					'description' => 'Isola os posteriores de coxa. Deitado na máquina, flexione os joelhos trazendo o peso em direção aos glúteos.',
					'equipment' => 'Máquina',
				],
				[
					'name' => 'Stiff',
					'description' => 'Trabalha posteriores de coxa e glúteos. Com os joelhos levemente flexionados, desça a barra rente às pernas mantendo a coluna reta.',
					'equipment' => 'Barra',
				],
				[
					'name' => 'Elevação pélvica',
					'description' => 'Foca nos glúteos. Com as costas apoiadas no banco, eleve o quadril contraindo os glúteos no topo do movimento.',
					'equipment' => 'Barra',
				],
			],
			'Panturrilhas' => [
				[
					'name' => 'Panturrilha em pé',
					'description' => 'Exercício básico para panturrilha. Em pé, eleve os calcanhares o máximo possível e desça controladamente até alongar a panturrilha.',
					'equipment' => 'Máquina',
				],
				[
					'name' => 'Panturrilha sentado',
					'description' => 'Enfatiza o sóleo. Sentado na máquina, eleve os calcanhares empurrando o peso e desça de forma controlada.',
					'equipment' => 'Máquina',
				],
			],
			'Abdômen' => [
				[
					'name' => 'Abdominal reto',
					'description' => 'Exercício básico para o core. Deitado, flexione o tronco em direção aos joelhos contraindo o abdômen e retorne controladamente.',
					'equipment' => 'Peso corporal',
				],
				[
					'name' => 'Prancha',
					'description' => 'Exercício isométrico para o core. Apoiado nos antebraços e pontas dos pés, mantenha o corpo alinhado e o abdômen contraído.',
					'equipment' => 'Peso corporal',
				],
				[
					'name' => 'Elevação de pernas',
					'description' => 'Trabalha a porção inferior do abdômen. Deitado, eleve as pernas estendidas até a vertical e desça sem tocar o chão.',
					'equipment' => 'Peso corporal',
				],
			],
		];

		foreach ($exercises as $muscleGroupName => $items) {
			$muscleGroup = MuscleGroup::firstWhere('name', $muscleGroupName);

			if (! $muscleGroup) {
				continue;
			}

			foreach ($items as $item) {
				Exercise::create([
					'muscle_group_id' => $muscleGroup->id,
					'name' => $item['name'],
					'description' => $item['description'],
					'equipment' => $item['equipment'],
					'video_url' => null,
				]);
			}
		}
	}
}
