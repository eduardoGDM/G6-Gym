<?php

namespace App\Http\Requests\Trainer;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStudentAnamnesisRequest extends FormRequest
{
	public function authorize(): bool
	{
		return in_array($this->user()?->role, ['trainer', 'admin'], true);
	}

	public function rules(): array
	{
		return [
			'observations' => 'nullable|string',
		];
	}
}
