<?php

namespace App\Service\Payment;

final class PaymentIntentResult
{
    public function __construct(
        public readonly string $provider,
        public readonly string $reference,
        public readonly string $redirectUrl,
        public readonly ?string $providerTransactionId = null,
        public readonly array $raw = [],
    ) {
    }
}
