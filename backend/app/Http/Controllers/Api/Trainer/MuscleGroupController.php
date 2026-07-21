<?php

namespace App\Http\Controllers\Api\Trainer;

use App\Http\Controllers\Controller;
use App\Models\MuscleGroup;

class MuscleGroupController extends Controller
{
	public function index()
	{
		return response()->json(
			MuscleGroup::all()
		);
	}
}
