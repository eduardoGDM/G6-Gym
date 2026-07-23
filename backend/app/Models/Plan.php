<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
	use HasFactory;

	protected $table = 'plans';

	protected $fillable = [
		'code',
		'name',
		'price_cents',
		'student_limit',
		'allows_physical_assessment',
		'allows_photos',
		'allows_videos',
		'allows_pdf',
		'sort_order',
	];

	protected $casts = [
		'price_cents' => 'integer',
		'student_limit' => 'integer',
		'allows_physical_assessment' => 'boolean',
		'allows_photos' => 'boolean',
		'allows_videos' => 'boolean',
		'allows_pdf' => 'boolean',
		'sort_order' => 'integer',
	];

	public function subscriptions(): HasMany
	{
		return $this->hasMany(Subscription::class);
	}

	/** Plano sem limite de alunos. */
	public function isUnlimited(): bool
	{
		return $this->student_limit === null;
	}
}
