<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <title>Ficha de Treino - {{ $student->user->name }}</title>
    <style>
        /*
         * Paleta replicada de frontend/src/index.css (@theme do Tailwind)
         * background #0b0b0f | card #17171d | primary #7c3aed | secondary #a78bfa
         * muted #1f1f29 | muted-foreground #b4b4c3 | accent #23232f | border #2a2a35
         * foreground #f8fafc | success (status ativo) #4ade80
         *
         * A página inteira É a ficha: fundo do @page e do body usam a mesma cor
         * de "card" (#17171d), com margem mínima, para eliminar a moldura clara
         * e manter cabeçalho/rodapé dentro do mesmo documento contínuo.
         */
        @page {
            margin: 18px 18px 20px 18px;
            background-color: #17171d;
        }

        * {
            box-sizing: border-box;
        }

       html {
		margin: 0;
		padding: 0;
		}

		body {
			margin: 0;
			padding: 18px;
			background: #17171d;

			color: #f8fafc;
			font-family: "DejaVu Sans", sans-serif;
			font-size: 9px;
			line-height: 1.4;
		}

        /* ---------- Cabeçalho (parte do fluxo do documento, não repete) ---------- */
        header {
            position: relative;
            padding: 0 0 8px 0;
            border-bottom: 1.5px solid #7c3aed;
            margin-bottom: 10px;
        }

        .brand-mark {
            display: inline-block;
            width: 22px;
            height: 22px;
            border-radius: 6px;
            background-color: #7c3aed;
            color: #ffffff;
            font-size: 9.5px;
            font-weight: bold;
            text-align: center;
            line-height: 22px;
            vertical-align: middle;
        }

        .brand-text {
            display: inline-block;
            vertical-align: middle;
            margin-left: 8px;
        }

        .brand-title {
            display: block;
            font-size: 12px;
            font-weight: bold;
            color: #f8fafc;
        }

        .brand-sub {
            display: block;
            font-size: 6.5px;
            color: #a78bfa;
            text-transform: uppercase;
            letter-spacing: 1.4px;
            margin-top: 1px;
        }

        .header-right {
            text-align: right;
        }

        .header-meta {
            font-size: 7px;
            color: #b4b4c3;
            margin-top: 6px;
        }

        /* ---------- Dados do aluno ---------- */
        .student-section {
            margin-bottom: 10px;
            padding-bottom: 8px;
            border-bottom: 0.75px solid #2a2a35;
        }

        .student-section table {
            width: 100%;
            border-collapse: collapse;
        }

        .student-section td {
            padding: 2px 6px 2px 0;
            vertical-align: top;
        }

        .student-label {
            display: block;
            font-size: 6.5px;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            color: #a78bfa;
            margin-bottom: 1px;
        }

        .student-value {
            font-size: 8.5px;
            color: #f8fafc;
            font-weight: bold;
        }

        /* ---------- Rodapé (repete em todas as páginas) ---------- */
        footer {
            position: fixed;
            bottom: -14px;
            left: 0;
            right: 0;
            height: 14px;
            font-size: 7px;
            color: #b4b4c3;
            border-top: 0.75px solid #2a2a35;
            padding-top: 4px;
        }

        .page-num:after {
            content: counter(page);
        }

        /* ---------- Barra de resumo / KPIs ---------- */
        .summary-row {
            width: 100%;
            margin-bottom: 10px;
            padding-bottom: 9px;
            border-bottom: 0.75px solid #2a2a35;
        }

        .summary-chip {
            display: inline-block;
            background-color: #1f1f29;
            border: 0.75px solid #2a2a35;
            border-radius: 8px;
            padding: 5px 10px;
            margin-right: 6px;
            font-size: 7.5px;
            color: #b4b4c3;
        }

        .summary-chip strong {
            color: #a78bfa;
            font-size: 9px;
        }

        /* ---------- Card de treino ---------- */
        .workout-block {
            margin-bottom: 9px;
            background-color: #17171d;
            border: 0.75px solid #2a2a35;
            border-radius: 8px;
            page-break-inside: avoid;
        }

        .workout-topbar {
            height: 3px;
            background-color: #7c3aed;
            border-radius: 8px 8px 0 0;
        }

        .workout-head {
            padding: 6px 10px;
            border-bottom: 0.75px solid #2a2a35;
        }

        .workout-letter {
            display: inline-block;
            width: 16px;
            height: 16px;
            border-radius: 4px;
            background-color: #7c3aed;
            color: #ffffff;
            text-align: center;
            line-height: 16px;
            font-size: 8.5px;
            font-weight: bold;
            vertical-align: middle;
        }

        .workout-name {
            display: inline-block;
            vertical-align: middle;
            margin-left: 7px;
            font-size: 11px;
            font-weight: bold;
            color: #f8fafc;
        }

        .workout-count {
            float: right;
            font-size: 7.5px;
            color: #b4b4c3;
            line-height: 16px;
        }

        .workout-sub {
            padding: 6px 10px;
            border-bottom: 0.75px solid #2a2a35;
            background-color: #1a1a21;
        }

        .muscle-tag {
            display: inline-block;
            background-color: #1f1f29;
            color: #a78bfa;
            border: 0.5px solid #2a2a35;
            border-radius: 8px;
            padding: 2px 7px;
            margin-right: 4px;
            font-size: 6.5px;
            font-weight: bold;
            letter-spacing: 0.4px;
        }

        .workout-desc {
            font-size: 8px;
            color: #b4b4c3;
            margin-top: 4px;
        }

        /* ---------- Tabela de exercícios ---------- */
        table.ex-table {
            width: 100%;
            border-collapse: collapse;
        }

        table.ex-table th {
            background-color: #7c3aed;
            color: #ffffff;
            font-size: 7px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            text-align: left;
            padding: 4px 8px;
        }

        table.ex-table td {
            font-size: 8.5px;
            padding: 4px 8px;
            border-bottom: 0.5px solid #2a2a35;
            vertical-align: top;
            color: #e4e4ec;
        }

        table.ex-table tbody tr.row-even {
            background-color: #1c1c24;
        }

        .col-name { width: 30%; }
        .col-sets { width: 8%; }
        .col-reps { width: 9%; }
        .col-load { width: 10%; }
        .col-rest { width: 10%; }
        .col-notes { width: 33%; }

        .ex-name {
            font-weight: bold;
            color: #f8fafc;
        }

        .ex-group {
            display: block;
            font-size: 6.5px;
            color: #a78bfa;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            margin-top: 1px;
        }

        .ex-variable {
            color: #b4b4c3;
            font-style: italic;
        }

        .ex-notes {
            color: #b4b4c3;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }

        /* ---------- Mini tabela de séries variáveis ---------- */
        tr.detail-row td {
            padding: 0 8px 6px 8px;
            border-bottom: 0.5px solid #2a2a35;
            background-color: #17171d;
        }

        table.mini-table {
            width: 100%;
            border-collapse: collapse;
            background-color: #1f1f29;
            border: 0.5px solid #2a2a35;
            border-radius: 4px;
        }

        table.mini-table th {
            font-size: 6.5px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            color: #a78bfa;
            text-align: left;
            padding: 3px 7px;
            border-bottom: 0.5px solid #2a2a35;
        }

        table.mini-table td {
            font-size: 8px;
            padding: 3px 7px;
            color: #e4e4ec;
        }

        /* ---------- Caixa de observações ---------- */
        .notes-box {
            margin-top: 6px;
            background-color: #1f1f29;
            border-left: 2.5px solid #7c3aed;
            border-radius: 0 4px 4px 0;
            padding: 5px 8px;
            font-size: 7.5px;
            color: #b4b4c3;
        }

        .empty-state {
            text-align: center;
            padding: 30px;
            color: #b4b4c3;
            font-size: 10px;
            background-color: #17171d;
            border: 0.75px solid #2a2a35;
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <header>
        <table style="width: 100%; border: none;">
            <tr>
                <td style="border: none; width: 55%;">
                    <span class="brand-mark">G6</span>
                    <span class="brand-text">
                        <span class="brand-title">Ficha de Treino</span>
                        <span class="brand-sub">G6 &middot; Gestão de Academia</span>
                    </span>
                </td>
                <td style="border: none; width: 45%;" class="header-right">
                    <div class="header-meta">Gerado em {{ $generatedAt->format('d/m/Y H:i') }}</div>
                </td>
            </tr>
        </table>
    </header>

    <div class="student-section">
        <table>
            <tr>
                <td style="width: 28%;">
                    <span class="student-label">Nome</span>
                    <span class="student-value">{{ $student->user->name }}</span>
                </td>
                <td style="width: 28%;">
                    <span class="student-label">Email</span>
                    <span class="student-value">{{ $student->user->email }}</span>
                </td>
                <td style="width: 18%;">
                    <span class="student-label">Telefone</span>
                    <span class="student-value">{{ $student->phone ?? '—' }}</span>
                </td>
                <td style="width: 16%;">
                    <span class="student-label">Personal</span>
                    <span class="student-value">{{ $trainer->name ?? '—' }}</span>
                </td>
                <td style="width: 10%;">
                    <span class="student-label">Gerado em</span>
                    <span class="student-value">{{ $generatedAt->format('d/m/Y') }}</span>
                </td>
            </tr>
        </table>
    </div>

    <footer>
        <table style="width: 100%; border: none;">
            <tr>
                <td style="border: none; width: 34%;">G6 &middot; Gestão de Academia</td>
                <td style="border: none; width: 32%; text-align: center;">Página <span class="page-num"></span></td>
                <td style="border: none; width: 34%; text-align: right;">Gerado em {{ $generatedAt->format('d/m/Y H:i') }}</td>
            </tr>
        </table>
    </footer>

    @if($workouts->isEmpty())
        <div class="empty-state">
            Este aluno não possui treinos ativos no momento.
        </div>
    @else
        <div class="summary-row">
            <span class="summary-chip"><strong>{{ $workouts->count() }}</strong> treino{{ $workouts->count() > 1 ? 's' : '' }} ativo{{ $workouts->count() > 1 ? 's' : '' }}</span>
            <span class="summary-chip"><strong>{{ $workouts->sum(fn ($w) => $w->workoutExercises->count()) }}</strong> exercícios no total</span>
        </div>
    @endif

    @php
        $formatLoad = function ($value) {
            if ($value === null) {
                return null;
            }
            $value = (float) $value;
            $formatted = fmod($value, 1) === 0.0 ? number_format($value, 0, ',', '.') : number_format($value, 2, ',', '.');
            return $formatted . 'kg';
        };

        $compareFields = ['repetitions', 'weight', 'rest_time', 'rir', 'tempo', 'cadence', 'duration', 'notes'];

        $fieldLabels = [
            'repetitions' => 'Reps',
            'weight' => 'Carga',
            'rest_time' => 'Descanso',
            'rir' => 'RIR',
            'tempo' => 'Tempo',
            'cadence' => 'Cadência',
            'duration' => 'Duração',
            'notes' => 'Obs.',
        ];
    @endphp

    @foreach($workouts as $index => $workout)
        <div class="workout-block">
            <div class="workout-topbar"></div>
            <div class="workout-head">
                <span class="workout-count">{{ $workout->workoutExercises->count() }} exercício{{ $workout->workoutExercises->count() != 1 ? 's' : '' }}</span>
                <span class="workout-letter">{{ chr(65 + ($index % 26)) }}</span>
                <span class="workout-name">{{ $workout->name }}</span>
            </div>

            @if($workout->muscleGroups->isNotEmpty() || $workout->description)
                <div class="workout-sub">
                    @foreach($workout->muscleGroups as $muscleGroup)
                        <span class="muscle-tag">{{ strtoupper($muscleGroup->name) }}</span>
                    @endforeach

                    @if($workout->description)
                        <div class="workout-desc">{{ $workout->description }}</div>
                    @endif
                </div>
            @endif

            <table class="ex-table">
                <thead>
                    <tr>
                        <th class="col-name">Exercício</th>
                        <th class="col-sets">Séries</th>
                        <th class="col-reps">Reps</th>
                        <th class="col-load">Carga</th>
                        <th class="col-rest">Descanso</th>
                        <th class="col-notes">Observações</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($workout->workoutExercises as $exerciseIndex => $workoutExercise)
                        @php
                            $seriesList = $workoutExercise->series;
                            $first = $seriesList->first();

                            $isUniform = $seriesList->count() <= 1 || $seriesList->every(function ($s) use ($first, $compareFields) {
                                foreach ($compareFields as $field) {
                                    if ($s->{$field} != $first->{$field}) {
                                        return false;
                                    }
                                }
                                return true;
                            });

                            $activeCols = [];
                            if (!$isUniform) {
                                foreach ($fieldLabels as $field => $label) {
                                    if ($seriesList->contains(fn ($s) => $s->{$field} !== null && $s->{$field} !== '')) {
                                        $activeCols[$field] = $label;
                                    }
                                }
                            }

                            $extras = [];
                            if ($first) {
                                if ($first->rir !== null) $extras[] = 'RIR ' . $first->rir;
                                if ($first->tempo !== null) $extras[] = 'Tempo ' . $first->tempo;
                                if ($first->cadence !== null) $extras[] = 'Cad. ' . $first->cadence;
                                if ($first->duration !== null) $extras[] = $first->duration . 's';
                            }

                            $notesParts = array_filter([
                                $workoutExercise->notes,
                                $isUniform ? ($first->notes ?? null) : null,
                                $extras ? implode(' · ', $extras) : null,
                            ]);
                        @endphp
                        <tr class="{{ $exerciseIndex % 2 === 1 ? 'row-even' : '' }}">
                            <td class="col-name">
                                <span class="ex-name">{{ $exerciseIndex + 1 }}. {{ $workoutExercise->exercise->name }}</span>
                                @if($workoutExercise->exercise->muscleGroup)
                                    <span class="ex-group">{{ $workoutExercise->exercise->muscleGroup->name }}</span>
                                @endif
                            </td>

                            @if($seriesList->isEmpty())
                                <td class="col-sets">—</td>
                                <td class="col-reps">—</td>
                                <td class="col-load">—</td>
                                <td class="col-rest">—</td>
                            @elseif($isUniform)
                                <td class="col-sets">{{ $seriesList->count() }}</td>
                                <td class="col-reps">{{ $first->repetitions ?? '—' }}</td>
                                <td class="col-load">{{ $formatLoad($first->weight) ?? '—' }}</td>
                                <td class="col-rest">{{ $first->rest_time !== null ? $first->rest_time . 's' : '—' }}</td>
                            @else
                                <td class="col-sets">{{ $seriesList->count() }}</td>
                                <td class="col-reps ex-variable" colspan="3">variável &middot; ver detalhe abaixo</td>
                            @endif

                            <td class="col-notes ex-notes">{{ implode(' — ', $notesParts) ?: '—' }}</td>
                        </tr>

                        @if(!$isUniform)
                            <tr class="detail-row">
                                <td colspan="6">
                                    <table class="mini-table">
                                        <tr>
                                            <th>Série</th>
                                            @foreach($activeCols as $label)
                                                <th>{{ $label }}</th>
                                            @endforeach
                                        </tr>
                                        @foreach($seriesList as $series)
                                            <tr>
                                                <td>{{ $series->order }}</td>
                                                @foreach($activeCols as $field => $label)
                                                    <td>
                                                        @if($field === 'weight')
                                                            {{ $formatLoad($series->weight) ?? '—' }}
                                                        @elseif($field === 'rest_time')
                                                            {{ $series->rest_time !== null ? $series->rest_time . 's' : '—' }}
                                                        @elseif($field === 'duration')
                                                            {{ $series->duration !== null ? $series->duration . 's' : '—' }}
                                                        @else
                                                            {{ $series->{$field} ?? '—' }}
                                                        @endif
                                                    </td>
                                                @endforeach
                                            </tr>
                                        @endforeach
                                    </table>
                                </td>
                            </tr>
                        @endif
                    @endforeach
                </tbody>
            </table>
        </div>
    @endforeach
</body>
</html>
