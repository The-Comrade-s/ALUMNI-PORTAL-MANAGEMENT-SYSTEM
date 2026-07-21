<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\NewsRequest;
use App\Http\Resources\NewsResource;
use App\Models\News;
use Illuminate\Http\Request;

class NewsController extends Controller
{
    public function index(Request $request)
    {
        $news = News::query()
            ->with('author')
            ->whereNotNull('published_at')
            ->when($request->filled('category'), fn ($q) => $q->where('category', $request->category))
            ->orderByDesc('is_pinned')
            ->orderByDesc('published_at')
            ->paginate($request->integer('per_page', 12));

        return NewsResource::collection($news);
    }

    public function store(NewsRequest $request)
    {
        $this->authorize('create', News::class);

        $news = News::create([...$request->validated(), 'author_id' => $request->user()->id]);

        return new NewsResource($news->load('author'));
    }

    public function show(News $news)
    {
        return new NewsResource($news->load('author'));
    }

    public function update(NewsRequest $request, News $news)
    {
        $this->authorize('update', $news);

        $news->update($request->validated());

        return new NewsResource($news->fresh('author'));
    }

    public function destroy(News $news)
    {
        $this->authorize('delete', $news);

        $news->delete();

        return response()->json(['message' => 'News item deleted.']);
    }
}
