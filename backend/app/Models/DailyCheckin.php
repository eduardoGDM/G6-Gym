<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DailyCheckin extends Model
{
	use HasFactory;

	protected $table = 'daily_checkins';

	protected $fillable = [
		'student_profile_id',
		'date',
		'sleep_rating',
		'sleep_notes',
		'diet_rating',
		'diet_notes',
	];

	protected $casts = [
		'date' => 'date',
		'sleep_rating' => 'integer',
		'diet_rating' => 'integer',
	];

	public function studentProfile(): BelongsTo
	{
		return $this->belongsTo(StudentProfile::class);
	}
}
