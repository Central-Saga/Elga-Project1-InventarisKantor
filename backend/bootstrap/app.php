<?php

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->api();
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $apiError = static function (
            int $status,
            string $message,
            ?array $errors = null,
            array $headers = [],
        ) {
            return response()->json([
                'success' => false,
                'message' => $message,
                'data' => null,
                'errors' => $errors,
            ], $status, $headers);
        };

        $exceptions->render(function (AuthenticationException $e, Request $request) use ($apiError) {
            if ($request->is('api/*')) {
                return $apiError(401, 'Unauthenticated.');
            }
        });

        $exceptions->render(function (AuthorizationException $e, Request $request) use ($apiError) {
            if ($request->is('api/*')) {
                return $apiError(403, 'Anda tidak memiliki hak untuk melakukan aksi ini.');
            }
        });

        $exceptions->render(function (ValidationException $e, Request $request) use ($apiError) {
            if ($request->is('api/*')) {
                return $apiError(422, 'Data yang dikirim tidak valid.', $e->errors());
            }
        });

        $exceptions->render(function (ModelNotFoundException $e, Request $request) use ($apiError) {
            if ($request->is('api/*')) {
                return $apiError(404, 'Data tidak ditemukan.');
            }
        });

        $exceptions->render(function (HttpExceptionInterface $e, Request $request) use ($apiError) {
            if ($request->is('api/*')) {
                $status = $e->getStatusCode();
                $message = $status >= 500
                    ? 'Terjadi kesalahan pada server.'
                    : ($e->getMessage() ?: 'Permintaan tidak dapat diproses.');

                return $apiError($status, $message, null, $e->getHeaders());
            }
        });

        $exceptions->render(function (\Throwable $e, Request $request) use ($apiError) {
            if ($request->is('api/*')) {
                return $apiError(500, 'Terjadi kesalahan pada server.');
            }
        });
    })->create();
