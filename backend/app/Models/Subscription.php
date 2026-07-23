<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
	use HasFactory;

	public const STATUS_ACTIVE = 'active';
	public const STATUS_CANCELED = 'canceled';
	public const STATUS_EXPIRED = 'expired';

	/** Atribuição manual pelo admin. O gateway usará a própria origem. */
	public const SOURCE_MANUAL = 'manual';

	protected $table = 'subscriptions';

	protected $fillable = [
		'trainer_id',
		'plan_id',
		'status',
		'starts_at',
		'ends_at',
		'source',
		'assigned_by',
		'notes',
	];

	protected $casts = [
		'starts_at' => 'datetime',
		'ends_at' => 'datetime',
	];

	public function trainer(): BelongsTo
	{
		return $this->belongsTo(User::class, 'trainer_id');
	}

	public function plan(): BelongsTo
	{
		return $this->belongsTo(Plan::class);
	}

	public function assignedBy(): BelongsTo
	{
		return $this->belongsTo(User::class, 'assigned_by');
	}

	/**
	 * Assinatura vigente: ativa e ainda dentro da validade. `ends_at` nulo
	 * significa sem vencimento, que é o caso das atribuições manuais.
	 */
	public function scopeCurrent(Builder $query): Builder
	{
		return $query->where('status', self::STATUS_ACTIVE)
			->where(function ($validity) {
				$validity->whereNull('ends_at')->orWhere('ends_at', '>=', now());
			});
	}

	public function isExpired(): bool
	{
		return $this->ends_at !== null && $this->ends_at->isPast();
	}
}
