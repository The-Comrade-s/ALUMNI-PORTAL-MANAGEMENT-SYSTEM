<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        return AuditLog::with('user:id,name,email')
            ->when($request->filled('auditable_type'), fn ($q) => $q->where('auditable_type', $request->auditable_type))
            ->when($request->filled('user_id'), fn ($q) => $q->where('user_id', $request->user_id))
            ->latest()
            ->paginate($request->integer('per_page', 30));
    }
}
