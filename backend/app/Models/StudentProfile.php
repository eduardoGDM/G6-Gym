<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class StudentProfile extends Model
{
	use HasFactory, SoftDeletes;

	/**
	 * Quantos dias de descanso são tolerados entre dois treinos sem quebrar o streak.
	 * Com 1, treinar dia sim / dia não mantém a sequência (fim de semana não zera).
	 */
	public const MAX_REST_GAP_DAYS = 1;

	/**
	 * Dias que uma vaga continua ocupada depois que o aluno é removido.
	 *
	 * Sem essa retenção, o personal poderia remover e recadastrar alunos em
	 * sequência para caber num plano menor do que realmente usa. Não limitamos a
	 * quantidade de treinos por isso: puniria justamente o coach que faz
	 * periodização, que é o cliente-alvo.
	 */
	public const SLOT_RELEASE_DAYS = 30;

	protected $table = 'student_profiles';

	protected $fillable = [
		'user_id',
		'trainer_id',
		'cpf',
		'phone',
		'birth_date',
		'gender',
		'height',
		'photo',
		'observations',
	];

	protected $casts = [
		'birth_date' => 'date',
		'height' => 'decimal:2',
	];

	/**
	 * Base da contagem de vagas: alunos que ainda ocupam capacidade do plano —
	 * os ativos e os removidos há menos de SLOT_RELEASE_DAYS.
	 *
	 * Toda contagem de vaga nasce daqui, para que a regra exista num lugar só.
	 * A vaga é contada por **CPF distinto** (a coluna já é única globalmente),
	 * de modo que a identidade da pessoa é o que ocupa o lugar.
	 */
	private static function slotBaseQuery(): QueryBuilder
	{
		return DB::table('student_profiles')->where(function ($query) {
			$query->whereNull('student_profiles.deleted_at')
				->orWhere(
					'student_profiles.deleted_at',
					'>=',
					Carbon::now()->subDays(self::SLOT_RELEASE_DAYS),
				);
		});
	}

	/** Vagas ocupadas por um personal, contadas no momento do cadastro do aluno. */
	public static function usedSlotsFor(int $trainerId): int
	{
		return (int) self::slotBaseQuery()
			->where('student_profiles.trainer_id', $trainerId)
			->distinct()
			->count('student_profiles.cpf');
	}

	/**
	 * Mesma contagem, como subquery correlacionada — evita N+1 em listagens
	 * paginadas (ex.: painel do admin).
	 */
	public static function usedSlotsSubquery(string $trainerColumn): QueryBuilder
	{
		return self::slotBaseQuery()
			->selectRaw('count(distinct student_profiles.cpf)')
			->whereColumn('student_profiles.trainer_id', $trainerColumn);
	}

	public function user(): BelongsTo
	{
		return $this->belongsTo(User::class);
	}

	public function trainer(): BelongsTo
	{
		return $this->belongsTo(User::class, 'trainer_id');
	}

	public function workouts(): HasMany
	{
		return $this->hasMany(Workout::class);
	}

	public function latestWorkout(): HasOne
	{
		return $this->hasOne(Workout::class)->latestOfMany();
	}

	/**
	 * Avaliações físicas da mais recente para a mais antiga: é essa ordem que
	 * a tela usa e que permite comparar cada avaliação com a anterior.
	 */
	public function physicalAssessments(): HasMany
	{
		return $this->hasMany(PhysicalAssessment::class)
			->orderByDesc('assessment_date')
			->orderByDesc('id');
	}

	public function workoutCheckins(): HasMany
	{
		return $this->hasMany(WorkoutCheckin::class);
	}

	public function dailyCheckins(): HasMany
	{
		return $this->hasMany(DailyCheckin::class);
	}

	public function anamnesis(): HasOne
	{
		return $this->hasOne(StudentAnamnesis::class);
	}

	/**
	 * Calcula a sequência de treinos (streak) a partir dos dias distintos com
	 * check-in de treino. Tolera até MAX_REST_GAP_DAYS de descanso entre treinos:
	 * a sequência atual só é considerada viva se o último treino estiver dentro
	 * dessa tolerância em relação a hoje.
	 *
	 * @return array{current: int, longest: int}
	 */
	public function workoutStreak(): array
	{
		$days = $this->workoutCheckins()
			->orderByDesc('performed_at')
			->pluck('performed_at')
			->map(fn ($date) => Carbon::parse($date)->startOfDay())
			->unique(fn ($date) => $date->toDateString())
			->values();

		if ($days->isEmpty()) {
			return ['current' => 0, 'longest' => 0];
		}

		$maxGap = self::MAX_REST_GAP_DAYS + 1;
		$today = Carbon::today();

		$current = 0;
		if (abs($today->diffInDays($days->first())) <= $maxGap) {
			$current = 1;
			for ($i = 1; $i < $days->count(); $i++) {
				if (abs($days[$i - 1]->diffInDays($days[$i])) <= $maxGap) {
					$current++;
				} else {
					break;
				}
			}
		}

		$longest = 1;
		$run = 1;
		for ($i = 1; $i < $days->count(); $i++) {
			$run = abs($days[$i - 1]->diffInDays($days[$i])) <= $maxGap ? $run + 1 : 1;
			$longest = max($longest, $run);
		}

		return ['current' => $current, 'longest' => $longest];
	}
}
