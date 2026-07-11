<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class AlumniApprovalController extends Controller
{
    /** Pending alumni awaiting approval. */
    public function index()
    {
        return User::with('alumniProfile.programme.department.school', 'alumniProfile.graduationYear')
            ->where('status', 'pending')
            ->whereHas('role', fn ($q) => $q->where('slug', 'alumni'))
            ->latest()
            ->paginate(20);
    }

    public function approve(User $user, Request $request)
    {
        $user->update(['status' => 'active']);
        $user->alumniProfile?->update(['verified_by' => $request->user()->id, 'verified_at' => now()]);

        NotificationService::notify(
            $user,
            'account_approved',
            'Your account has been approved',
            'You now have full access to the alumni directory, jobs, and events.'
        );

        return response()->json(['message' => "{$user->name} approved.", 'user' => $user->fresh()]);
    }

    public function reject(User $user)
    {
        $user->update(['status' => 'suspended']);

        NotificationService::notify(
            $user,
            'account_rejected',
            'Your registration could not be approved',
            'Please contact the alumni office if you believe this is a mistake.'
        );

        return response()->json(['message' => "{$user->name} rejected.", 'user' => $user->fresh()]);
    }
}
