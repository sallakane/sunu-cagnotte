<?php

namespace App\Service\Payment;

use App\Enum\ContributionStatus;

final class PaymentVerificationResult
{
    public function __construct(
        public readonly bool $confirmed,
        public readonly ContributionStatus $status,
        public readonly ?string $providerTransactionId = null,
        public readonly ?string $providerFeeAmount = null,
        public readonly array $raw = [],
    ) {
    }
}
