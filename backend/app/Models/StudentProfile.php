<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

class StudentProfile extends Model
{
	use HasFactory, SoftDeletes;

	/**
	 * Quantos dias de descanso são tolerados entre dois treinos sem quebrar o streak.
	 * Com 1, treinar dia sim / dia não mantém a sequência (fim de semana não zera).
	 */
	public const MAX_REST_GAP_DAYS = 1;

	protected $table = 'student_profiles';

	protected $fillable = [
		'user_id',
		'trainer_id',
		'cpf',
		'phone',
		'birth_date',
		'gender',
		'height',
		'current_weight',
		'photo',
		'observations',
	];

	protected $casts = [
		'birth_date' => 'date',
		'height' => 'decimal:2',
		'current_weight' => 'decimal:2',
	];

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

	public function physicalAssessments(): HasMany
	{
		return $this->hasMany(PhysicalAssessment::class);
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
