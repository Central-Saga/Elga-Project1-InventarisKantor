<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class UserController extends Controller
{
    public function __construct(private readonly ActivityLogService $activityLog) {}

    public function index(Request $request)
    {
        Gate::authorize('viewAny', User::class);

        return response()->json([
            'success' => true,
            'data' => UserResource::collection(User::query()->latest()->get()),
        ]);
    }

    public function store(StoreUserRequest $request)
    {
        $validated = $request->validated();
        $validated['role'] = $this->normalizeRole($validated['role']);
        $user = User::create($validated);
        $this->activityLog->record('user.created', User::class, $user->id, [
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Akun berhasil dibuat.',
            'data' => new UserResource($user),
        ], 201);
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $validated = $request->validated();
        $validated['role'] = $this->normalizeRole($validated['role']);

        if (empty($validated['password'])) {
            unset($validated['password']);
        }

        $original = $user->getOriginal();
        $user->update($validated);
        $this->activityLog->record('user.updated', User::class, $user->id, [
            'before' => $original,
            'after' => $validated,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Akun berhasil diperbarui.',
            'data' => new UserResource($user),
        ]);
    }

    public function destroy(Request $request, User $user)
    {
        Gate::authorize('delete', $user);
        abort_if($request->user()->is($user), 422, 'Akun yang sedang digunakan tidak dapat dihapus.');

        $user->delete();
        $this->activityLog->record('user.deleted', User::class, $user->id, [
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Akun berhasil dihapus.',
        ]);
    }

    private function normalizeRole(string $role): string
    {
        return $role === 'staff' ? 'employee' : $role;
    }
}