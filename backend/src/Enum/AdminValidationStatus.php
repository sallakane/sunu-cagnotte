<?php

namespace App\Enum;

enum AdminValidationStatus: string
{
    case Pending = 'pending';
    case Approved = 'approved';
    case Rejected = 'rejected';
}

