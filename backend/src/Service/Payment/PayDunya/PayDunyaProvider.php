<?php

namespace App\Service\Payment\PayDunya;

use App\Enum\ContributionStatus;
use App\Service\Payment\PaymentIntentPayload;
use App\Service\Payment\PaymentIntentResult;
use App\Service\Payment\PaymentProviderInterface;
use App\Service\Payment\PaymentVerificationResult;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Contracts\HttpClient\HttpClientInterface;

final class PayDunyaProvider implements PaymentProviderInterface
{
    private HttpClientInterface $client;

    public function __construct(
        private readonly LoggerInterface $logger,
        private readonly string $mode,
        private readonly string $masterKey,
        private readonly string $privateKey,
        private readonly string $publicKey,
        private readonly string $token,
        private readonly string $storeName,
        private readonly string $storeTagline,
        ?HttpClientInterface $client = null,
    ) {
        $this->client = $client ?? HttpClient::create();
    }

    public function supports(string $provider): bool
    {
        return $provider === 'paydunya';
    }

    public function createIntent(PaymentIntentPayload $payload): PaymentIntentResult
    {
        $endpoint = $this->buildCreateEndpoint();
        $customer = [
            'name' => $payload->customerName,
        ];

        if ($payload->customerEmail !== null && trim($payload->customerEmail) !== '') {
            $customer['email'] = $payload->customerEmail;
        }

        if ($payload->customerPhone !== null && trim($payload->customerPhone) !== '') {
            $customer['phone'] = $payload->customerPhone;
        }

        $requestPayload = [
            'invoice' => [
                'items' => [
                    'item_0' => [
                        'name' => 'Contribution solidaire',
                        'quantity' => 1,
                        'unit_price' => (float) $payload->amount,
                        'total_price' => (float) $payload->amount,
                        'description' => $payload->description,
                    ],
                ],
                'total_amount' => (float) $payload->amount,
                'description' => $payload->description,
                'customer' => $customer,
            ],
            'store' => [
                'name' => $this->storeName,
                'tagline' => $this->storeTagline,
                'website_url' => $payload->returnUrl,
            ],
            'custom_data' => [
                'reference' => $payload->reference,
            ],
            'actions' => [
                'cancel_url' => $payload->returnUrl,
                'return_url' => $payload->returnUrl,
                'callback_url' => $payload->callbackUrl,
            ],
        ];

        $this->logger->info('PayDunya intent request.', [
            'mode' => $this->mode,
            'reference' => $payload->reference,
            'endpoint' => $endpoint,
        ]);

        $response = $this->client->request('POST', $endpoint, [
            'headers' => $this->buildHeaders(),
            'json' => $requestPayload,
        ]);

        $statusCode = $response->getStatusCode();
        $data = $response->toArray(false);

        if ($statusCode >= 400 || ($data['response_code'] ?? null) !== '00') {
            $this->logger->error('PayDunya intent failed.', [
                'status_code' => $statusCode,
                'response' => $data,
            ]);

            throw new \RuntimeException('PayDunya checkout creation failed.');
        }

        $redirectUrl = (string) ($data['response_text'] ?? '');
        $token = (string) ($data['token'] ?? '');

        if ($redirectUrl === '' || $token === '') {
            throw new \RuntimeException('PayDunya response is missing redirect URL or token.');
        }

        return new PaymentIntentResult(
            provider: 'paydunya',
            reference: $payload->reference,
            redirectUrl: $redirectUrl,
            providerTransactionId: $token,
            raw: $data,
        );
    }

    public function verify(array $payload): PaymentVerificationResult
    {
        $token = $this->extractToken($payload);

        if ($token === null) {
            throw new \RuntimeException('PayDunya token is missing.');
        }

        $endpoint = $this->buildConfirmEndpoint($token);

        $this->logger->info('PayDunya verification request.', [
            'payload' => $payload,
            'endpoint' => $endpoint,
        ]);

        $response = $this->client->request('GET', $endpoint, [
            'headers' => $this->buildHeaders(),
        ]);
        $statusCode = $response->getStatusCode();
        $data = $response->toArray(false);

        if ($statusCode >= 400 || ($data['response_code'] ?? null) !== '00') {
            $this->logger->error('PayDunya confirmation failed.', [
                'status_code' => $statusCode,
                'response' => $data,
            ]);

            throw new \RuntimeException('PayDunya payment confirmation failed.');
        }

        $expectedHash = hash('sha512', $this->masterKey);
        $responseHash = (string) ($data['hash'] ?? $data['data']['hash'] ?? '');

        if ($responseHash !== '' && !hash_equals($expectedHash, $responseHash)) {
            throw new \RuntimeException('PayDunya hash verification failed.');
        }

        $status = strtolower((string) (
            $data['status']
            ?? $data['data']['status']
            ?? 'pending'
        ));

        [$confirmed, $mappedStatus] = match ($status) {
            'paid', 'completed', 'success', 'successful' => [true, ContributionStatus::Paid],
            'failed', 'error' => [false, ContributionStatus::Failed],
            'cancelled', 'canceled' => [false, ContributionStatus::Cancelled],
            default => [false, ContributionStatus::Pending],
        };

        return new PaymentVerificationResult(
            confirmed: $confirmed,
            status: $mappedStatus,
            providerTransactionId: $token,
            providerFeeAmount: null,
            raw: $data,
        );
    }

    /**
     * @return array<string, string>
     */
    private function buildHeaders(): array
    {
        return [
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
            'PAYDUNYA-MASTER-KEY' => $this->masterKey,
            'PAYDUNYA-PRIVATE-KEY' => $this->privateKey,
            'PAYDUNYA-TOKEN' => $this->token,
        ];
    }

    private function buildCreateEndpoint(): string
    {
        return $this->mode === 'live'
            ? 'https://app.paydunya.com/api/v1/checkout-invoice/create'
            : 'https://app.paydunya.com/sandbox-api/v1/checkout-invoice/create';
    }

    private function buildConfirmEndpoint(string $token): string
    {
        $base = $this->mode === 'live'
            ? 'https://app.paydunya.com/api/v1/checkout-invoice/confirm/'
            : 'https://app.paydunya.com/sandbox-api/v1/checkout-invoice/confirm/';

        return $base.rawurlencode($token);
    }

    private function extractToken(array $payload): ?string
    {
        $token = $payload['token']
            ?? $payload['data']['invoice']['token']
            ?? $payload['invoice']['token']
            ?? null;

        if (!is_string($token)) {
            return null;
        }

        $token = trim($token);

        return $token !== '' ? $token : null;
    }
}
