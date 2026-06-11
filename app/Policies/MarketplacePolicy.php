<?php

namespace App\Policies;

use App\Models\Marketplace;
use App\Models\User;

class MarketplacePolicy
{
    public function update(User $user, Marketplace $marketplace): bool
    {
        return $user->id === $marketplace->user_id || $user->isPengurus();
    }

    public function delete(User $user, Marketplace $marketplace): bool
    {
        return $user->id === $marketplace->user_id || $user->isPengurus();
    }
}
