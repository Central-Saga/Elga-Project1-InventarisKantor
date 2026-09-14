<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $this->ensureAdmin($request);

        return response()->json([
            'success' => true,
            'data' => User::query()->latest()->get(['id', 'name', 'email', 'role']),
        ]);
    }

    public function store(Request $request)
    {
        $this->ensureAdmin($request);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'role' => ['required', Rule::in(['admin', 'employee', 'staff'])],
        ]);
        $validated['role'] = $this->normalizeRole($validated['role']);

        $user = User::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Akun berhasil dibuat.',
            'data' => $user->only(['id', 'name', 'email', 'role']),
        ], 201);
    }

    public function update(Request $request, User $user)
    {
        $this->ensureAdmin($request);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:6'],
            'role' => ['required', Rule::in(['admin', 'employee', 'staff'])],
        ]);
        $validated['role'] = $this->normalizeRole($validated['role']);

        if (empty($validated['password'])) {
            unset($validated['password']);
        } else {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Akun berhasil diperbarui.',
            'data' => $user->only(['id', 'name', 'email', 'role']),
        ]);
    }

    public function destroy(Request $request, User $user)
    {
        $this->ensureAdmin($request);
        abort_if($request->user()->is($user), 422, 'Akun admin yang sedang digunakan tidak dapat dihapus.');

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Akun berhasil dihapus.',
        ]);
    }

    private function ensureAdmin(Request $request): void
    {
        abort_unless($request->user()?->role === 'admin', 403, 'Hanya admin yang dapat mengelola akun.');
    }

    private function normalizeRole(string $role): string
    {
        return $role === 'staff' ? 'employee' : $role;
    }
}