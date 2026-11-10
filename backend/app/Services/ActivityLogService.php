<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\User;

class ActivityLogService
{
    /**
     * Catat satu entri audit trail untuk mutasi user/asset/atk/loan.
     */
    public function record(
        string $action,
        string $subjectType,
        ?int $subjectId = null,
        ?array $diff = null,
        ?User $actor = null,
    ): ActivityLog {
        return ActivityLog::create([
            'user_id' => $actor?->id ?? request()?->user()?->id,
            'action' => $action,
            'subject_type' => $subjectType,
            'subject_id' => $subjectId,
            'payload_diff' => $diff,
            'created_at' => now(),
        ]);
    }
}
