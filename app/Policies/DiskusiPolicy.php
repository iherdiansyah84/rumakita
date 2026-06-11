<?php

namespace App\Policies;

use App\Models\Diskusi;
use App\Models\User;

class DiskusiPolicy
{
    public function update(User $user, Diskusi $diskusi): bool
    {
        return $user->id === $diskusi->user_id || $user->isPengurus();
    }

    public function delete(User $user, Diskusi $diskusi): bool
    {
        return $user->id === $diskusi->user_id || $user->isPengurus();
    }
}
