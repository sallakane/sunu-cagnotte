<?php

namespace App\Service\Payment;

final class PaymentProviderRegistry
{
    /**
     * @param iterable<PaymentProviderInterface> $providers
     */
    public function __construct(
        private readonly iterable $providers,
    ) {
    }

    public function get(string $provider): PaymentProviderInterface
    {
        foreach ($this->providers as $candidate) {
            if ($candidate->supports($provider)) {
                return $candidate;
            }
        }

        throw new \InvalidArgumentException(sprintf('Unsupported payment provider "%s".', $provider));
    }
}

