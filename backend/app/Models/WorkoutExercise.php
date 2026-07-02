<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PhysicalAssessment extends Model
{
	use HasFactory;

	protected $table = 'physical_assessments';

	protected $fillable = [
		'student_profile_id',
		'assessment_date',
		'weight',
		'height',
		'fat_percentage',
		'muscle_mass',
		'chest',
		'waist',
		'abdomen',
		'hip',
		'left_arm',
		'right_arm',
		'left_thigh',
		'right_thigh',
		'left_calf',
		'right_calf',
		'observations',
	];

	protected $casts = [
		'assessment_date' => 'date',
		'weight' => 'decimal:2',
		'height' => 'decimal:2',
		'fat_percentage' => 'decimal:2',
		'muscle_mass' => 'decimal:2',
		'chest' => 'decimal:2',
		'waist' => 'decimal:2',
		'abdomen' => 'decimal:2',
		'hip' => 'decimal:2',
		'left_arm' => 'decimal:2',
		'right_arm' => 'decimal:2',
		'left_thigh' => 'decimal:2',
		'right_thigh' => 'decimal:2',
		'left_calf' => 'decimal:2',
		'right_calf' => 'decimal:2',
	];

	public function studentProfile(): BelongsTo
	{
		return $this->belongsTo(StudentProfile::class);
	}
}
