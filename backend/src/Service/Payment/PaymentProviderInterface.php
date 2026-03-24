<?php

namespace App\Service\Payment;

interface PaymentProviderInterface
{
    public function supports(string $provider): bool;

    public function createIntent(PaymentIntentPayload $payload): PaymentIntentResult;

    public function verify(array $payload): PaymentVerificationResult;
}

