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

        .col-ex { width: 26%; }
        .col-config { width: 23%; }
        .col-series { width: 34%; }
        .col-obs { width: 17%; }

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

        .ex-equip {
            display: block;
            font-size: 6.5px;
            color: #b4b4c3;
            margin-top: 1px;
        }

        .ex-notes {
            color: #b4b4c3;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }

        /* ---------- Coluna Configuração (resumo técnico) ---------- */
        .cfg-head {
            color: #f8fafc;
            font-weight: bold;
            margin-bottom: 3px;
        }

        .cfg-type {
            color: #a78bfa;
            font-weight: bold;
        }

        .cfg-line {
            margin-bottom: 1.5px;
            color: #e4e4ec;
        }

        .cfg-label {
            color: #a78bfa;
            text-transform: uppercase;
            font-size: 6px;
            letter-spacing: 0.3px;
        }

        /* ---------- Coluna Séries (uma linha por série) ---------- */
        .series-line {
            margin-bottom: 3px;
        }

        .series-bullet {
            color: #7c3aed;
            font-weight: bold;
        }

        .series-type {
            color: #f8fafc;
            font-weight: bold;
        }

        .series-sub {
            color: #b4b4c3;
        }

        .series-tech {
            display: block;
            color: #a78bfa;
            font-size: 7px;
            margin-top: 0.5px;
        }

        .series-note {
            display: block;
            color: #b4b4c3;
            font-style: italic;
            font-size: 7px;
            margin-top: 0.5px;
        }

        .series-empty {
            color: #b4b4c3;
            font-style: italic;
        }

        /* ---------- Caixa de técnica avançada ---------- */
        tr.technique-row td {
            padding: 0 8px 6px 8px;
            background-color: #17171d;
            border-bottom: 0.5px solid #2a2a35;
        }

        .technique-box {
            background-color: #1f1f29;
            border: 0.5px solid #2a2a35;
            border-left: 2.5px solid #7c3aed;
            border-radius: 0 4px 4px 0;
            padding: 5px 8px;
        }

        .technique-title {
            display: block;
            color: #a78bfa;
            text-transform: uppercase;
            font-size: 6px;
            letter-spacing: 0.4px;
            font-weight: bold;
            margin-bottom: 3px;
        }

        .technique-item {
            font-size: 7.5px;
            color: #b4b4c3;
            margin-bottom: 1.5px;
        }

        .technique-name {
            color: #f8fafc;
            font-weight: bold;
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
                    <span class="brand-mark">G6Fit</span>
                    <span class="brand-text">
                        <span class="brand-title">Ficha de Treino</span>
                        <span class="brand-sub">G6Fit &middot; Gestão de treinos</span>
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
                <td style="border: none; width: 34%;">G6Fit &middot; Gestão de treinos</td>
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

        // Valores distintos preservando a ordem de aparição (ex.: reps, RIR).
        $uniqueVals = function ($series, $key) {
            $out = [];
            foreach ($series as $s) {
                $v = $s->{$key};
                if ($v !== null && $v !== '' && !in_array($v, $out, true)) {
                    $out[] = $v;
                }
            }
            return $out;
        };

        // Tipo predominante (mais frequente) entre as séries.
        $predominantType = function ($series) {
            $counts = [];
            foreach ($series as $s) {
                if ($s->type !== null && $s->type !== '') {
                    $counts[$s->type] = ($counts[$s->type] ?? 0) + 1;
                }
            }
            if (empty($counts)) {
                return null;
            }
            arsort($counts);
            return array_key_first($counts);
        };

        $rirLabel = fn ($v) => $v === 'FALHA' ? 'Falha' : $v;
        $rirTag = fn ($v) => $v === 'FALHA' ? 'Falha' : 'RIR ' . $v;

        // Descrições fixas das técnicas avançadas (definidas pela aplicação).
        $techniqueDescriptions = [
            'Drop Set' => 'Reduza a carga (~30%) após a falha e continue sem descanso.',
            'Muscle Round' => '6 mini-séries de 6 repetições com pausas de 10–15 segundos.',
            'Cluster Set' => 'Divida a série em pequenos blocos com pausas curtas entre eles.',
            'Backoff Set' => 'Após as séries principais, reduza a carga (30–40%) e realize uma série adicional.',
            'Parciais' => 'Após a falha, continue com repetições parciais na faixa de maior tensão.',
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

            @if($workout->description)
                <div class="workout-sub">
                    <div class="workout-desc">{{ $workout->description }}</div>
                </div>
            @endif

            <table class="ex-table">
                <thead>
                    <tr>
                        <th class="col-ex">Exercício</th>
                        <th class="col-config">Configuração</th>
                        <th class="col-series">Séries</th>
                        <th class="col-obs">Observações</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($workout->workoutExercises as $exerciseIndex => $workoutExercise)
                        @php
                            $seriesList = $workoutExercise->series->sortBy('order')->values();

                            $reps = $uniqueVals($seriesList, 'repetitions');
                            $rirs = array_map($rirLabel, $uniqueVals($seriesList, 'rir'));
                            $techniques = $uniqueVals($seriesList, 'advanced_technique');
                            $cadences = $uniqueVals($seriesList, 'cadence');
                            $rests = array_map(fn ($v) => $v . 's', $uniqueVals($seriesList, 'rest_time'));
                            $predominant = $predominantType($seriesList);
                        @endphp
                        <tr class="{{ $exerciseIndex % 2 === 1 ? 'row-even' : '' }}">
                            <td class="col-ex">
                                <span class="ex-name">{{ $exerciseIndex + 1 }}. {{ $workoutExercise->exercise->name }}</span>
                                @if($workoutExercise->exercise->muscleGroup)
                                    <span class="ex-group">{{ $workoutExercise->exercise->muscleGroup->name }}</span>
                                @endif
                                @if($workoutExercise->exercise->equipment)
                                    <span class="ex-equip">{{ $workoutExercise->exercise->equipment }}</span>
                                @endif
                            </td>

                            <td class="col-config">
                                @if($seriesList->isEmpty())
                                    <span class="series-empty">Sem séries.</span>
                                @else
                                    @php
                                        $countText = $seriesList->count() . ' ' . ($seriesList->count() === 1 ? 'série' : 'séries');
                                    @endphp
                                    <div class="cfg-head">
                                        {{ $countText }}
                                        @if($predominant)
                                            &middot; <span class="cfg-type">{{ $predominant }}</span>
                                        @endif
                                    </div>
                                    @if($reps)
                                        <div class="cfg-line"><span class="cfg-label">Reps</span> {{ implode(' · ', $reps) }}</div>
                                    @endif
                                    @if($rirs)
                                        <div class="cfg-line"><span class="cfg-label">RIR</span> {{ implode(' · ', $rirs) }}</div>
                                    @endif
                                    @if($techniques)
                                        <div class="cfg-line"><span class="cfg-label">Técnica</span> {{ implode(' · ', $techniques) }}</div>
                                    @endif
                                    @if($cadences)
                                        <div class="cfg-line"><span class="cfg-label">Cadência</span> {{ implode(' · ', $cadences) }}</div>
                                    @endif
                                    @if($rests)
                                        <div class="cfg-line"><span class="cfg-label">Descanso</span> {{ implode(' · ', $rests) }}</div>
                                    @endif
                                @endif
                            </td>

                            <td class="col-series">
                                @if($seriesList->isEmpty())
                                    <span class="series-empty">Nenhuma série detalhada.</span>
                                @else
                                    @foreach($seriesList as $seriesIndex => $series)
                                        @php
                                            $load = $formatLoad($series->weight);
                                            $rirText = ($series->rir !== null && $series->rir !== '') ? $rirTag($series->rir) : null;
                                            $typeText = $series->type ?: 'Série ' . ($seriesIndex + 1);

                                            $subParts = [];
                                            if ($series->repetitions) $subParts[] = '— ' . $series->repetitions . ' reps';
                                            if ($load) $subParts[] = '· ' . $load;
                                            if ($rirText) $subParts[] = '(' . $rirText . ')';
                                            $subText = implode(' ', $subParts);
                                        @endphp
                                        <div class="series-line">
                                            <span class="series-bullet">•</span>
                                            <span class="series-type">{{ $typeText }}</span>
                                            @if($subText)
                                                <span class="series-sub">{{ $subText }}</span>
                                            @endif
                                            @if($series->advanced_technique)
                                                <span class="series-tech">{{ $series->advanced_technique }}</span>
                                            @endif
                                            @if($series->notes)
                                                <span class="series-note">{{ $series->notes }}</span>
                                            @endif
                                        </div>
                                    @endforeach
                                @endif
                            </td>

                            <td class="col-obs ex-notes">{{ $workoutExercise->notes ?: '—' }}</td>
                        </tr>

                        @if(!empty($techniques))
                            <tr class="technique-row">
                                <td colspan="4">
                                    <div class="technique-box">
                                        <span class="technique-title">Técnica Avançada</span>
                                        @foreach($techniques as $technique)
                                            @php $techniqueDesc = $techniqueDescriptions[$technique] ?? null; @endphp
                                            <div class="technique-item">
                                                <span class="technique-name">{{ $technique }}</span>
                                                @if($techniqueDesc)
                                                    — {{ $techniqueDesc }}
                                                @endif
                                            </div>
                                        @endforeach
                                    </div>
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
