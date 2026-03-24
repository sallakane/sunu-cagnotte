<?php

namespace App\Service\Payment;

final class PaymentIntentPayload
{
    public function __construct(
        public readonly string $reference,
        public readonly string $amount,
        public readonly string $currency,
        public readonly string $description,
        public readonly string $customerName,
        public readonly ?string $customerEmail,
        public readonly ?string $customerPhone,
        public readonly string $returnUrl,
        public readonly string $callbackUrl,
    ) {
    }
}
