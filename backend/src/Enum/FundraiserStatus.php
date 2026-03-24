<?php

namespace App\Enum;

enum FundraiserStatus: string
{
    case Draft = 'draft';
    case PendingReview = 'pending_review';
    case Published = 'published';
    case Rejected = 'rejected';
    case Completed = 'completed';
    case Archived = 'archived';
}

