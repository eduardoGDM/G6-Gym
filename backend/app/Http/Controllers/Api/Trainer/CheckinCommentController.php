<?php

namespace App\Http\Controllers\Api\Trainer;

use App\Http\Controllers\Controller;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Models\DailyCheckin;
use App\Models\WorkoutCheckin;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class CheckinCommentController extends Controller
{
	private const VALIDATION_RULES = [
		'body' => 'required|string|max:2000',
	];

	/**
	 * Restringe o check-in-alvo aos alunos vinculados ao trainer autenticado
	 * (student_profiles.trainer_id) — o mesmo escopo das listagens de check-in.
	 * Impede um trainer comentar no check-in de aluno de outro.
	 */
	private function scopeParentToTrainer(Builder $query, int $trainerId): Builder
	{
		return $query->whereHas('studentProfile', function ($query) use ($trainerId) {
			$query->where('trainer_id', $trainerId);
		});
	}

	public function storeOnDailyCheckin(Request $request, $id)
	{
		return $this->storeOnParent($request, DailyCheckin::query(), $id);
	}

	public function storeOnWorkoutCheckin(Request $request, $id)
	{
		return $this->storeOnParent($request, WorkoutCheckin::query(), $id);
	}

	private function storeOnParent(Request $request, Builder $query, $id)
	{
		$trainerId = $request->user()->id;

		$parent = $this->scopeParentToTrainer($query, $trainerId)
			->where('id', $id)
			->first();

		if (!$parent) {
			return response()->json([
				'message' => 'Check-in não encontrado'
			], 404);
		}

		$data = $request->validate(self::VALIDATION_RULES);

		$comment = $parent->comments()->create([
			'trainer_id' => $trainerId,
			'body' => $data['body'],
		]);

		$comment->load('trainer');

		return (new CommentResource($comment))
			->additional(['message' => 'Comentário enviado com sucesso'])
			->response()
			->setStatusCode(201);
	}

	public function update(Request $request, $id)
	{
		$comment = $this->resolveOwnComment($request, $id);

		if (!$comment) {
			return response()->json([
				'message' => 'Comentário não encontrado'
			], 404);
		}

		$data = $request->validate(self::VALIDATION_RULES);

		$comment->update(['body' => $data['body']]);
		$comment->load('trainer');

		return (new CommentResource($comment))
			->additional(['message' => 'Comentário atualizado com sucesso']);
	}

	public function destroy(Request $request, $id)
	{
		$comment = $this->resolveOwnComment($request, $id);

		if (!$comment) {
			return response()->json([
				'message' => 'Comentário não encontrado'
			], 404);
		}

		$comment->delete();

		return response()->json([
			'message' => 'Comentário removido com sucesso'
		]);
	}

	/**
	 * Um trainer só edita/exclui os próprios comentários (trainer_id).
	 */
	private function resolveOwnComment(Request $request, $id): ?Comment
	{
		return Comment::where('trainer_id', $request->user()->id)
			->where('id', $id)
			->first();
	}
}
