<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterAlumniRequest;
use App\Models\AlumniProfile;
use App\Models\Role;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

class AuthController extends Controller
{
    /**
     * Public self-registration for alumni. New accounts are created with
     * status = pending and must be approved by an Administrator or the
     * relevant Class Representative before gaining full directory access.
     */
    public function register(RegisterAlumniRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = DB::transaction(function () use ($data) {
            $alumniRole = Role::where('slug', Role::ALUMNI)->firstOrFail();

            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'password' => Hash::make($data['password']),
                'role_id' => $alumniRole->id,
                'status' => 'pending',
            ]);

            AlumniProfile::create([
                'user_id' => $user->id,
                'matric_number' => $data['matric_number'],
                'programme_id' => $data['programme_id'],
                'graduation_year_id' => $data['graduation_year_id'],
                'employment_status' => 'unemployed',
            ]);

            return $user;
        });

        event(new Registered($user));

        $this->notifyAdminsOfNewRegistration($user);

        return response()->json([
            'message' => 'Registration successful. Please verify your email; your account will also need approval before full access is granted.',
            'user' => $user->only(['id', 'name', 'email', 'status']),
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->only('email', 'password');

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            return response()->json([
                'message' => 'The provided credentials are incorrect.',
            ], 422);
        }

        $request->session()->regenerate();

        /** @var User $user */
        $user = Auth::user();
        $user->forceFill(['last_login_at' => now()])->save();

        return response()->json([
            'user' => $user->load('role', 'alumniProfile'),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user()->load('role', 'alumniProfile'),
        ]);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        $status = Password::sendResetLink($request->only('email'));

        return $status === Password::RESET_LINK_SENT
            ? response()->json(['message' => __($status)])
            : response()->json(['message' => __($status)], 422);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|confirmed|min:8',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill(['password' => Hash::make($password)])->save();
            }
        );

        return $status === Password::PASSWORD_RESET
            ? response()->json(['message' => __($status)])
            : response()->json(['message' => __($status)], 422);
    }

    private function notifyAdminsOfNewRegistration(User $newUser): void
    {
        $admins = User::whereHas('role', fn ($q) => $q->whereIn('slug', [Role::ADMIN, Role::SUPER_ADMIN]))->get();

        NotificationService::notifyMany(
            $admins,
            'alumni_pending_approval',
            'New alumni registration awaiting approval',
            "{$newUser->name} just registered and needs approval.",
            ['user_id' => $newUser->id]
        );
    }
}
