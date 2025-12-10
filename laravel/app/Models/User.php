<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'user_type',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function measurements()
    {
        return $this->hasMany(Measurement::class);
    }

    public function settings()
    {
        return $this->hasOne(Settings::class);
    }

    public function vendor()
    {
        return $this->hasOne(Vendor::class);
    }

    public function isVendor(): bool
    {
        return $this->user_type === 'VENDEUR';
    }
}













