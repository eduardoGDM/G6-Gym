<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\PlanResource;
use App\Models\Plan;

class PlanController extends Controller
{
	public function index()
	{
		return PlanResource::collection(Plan::orderBy('sort_order')->get());
	}
}
