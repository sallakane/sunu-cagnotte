<?php

namespace App\Service\Payment\PayTech;

use App\Enum\ContributionStatus;
use App\Service\Payment\PaymentIntentPayload;
use App\Service\Payment\PaymentIntentResult;
use App\Service\Payment\PaymentProviderInterface;
use App\Service\Payment\PaymentVerificationResult;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Contracts\HttpClient\HttpClientInterface;

final class PayTechProvider implements PaymentProviderInterface
{
    private const API_BASE_URL = 'https://paytech.sn/api';

    private HttpClientInterface $client;

    public function __construct(
        private readonly LoggerInterface $logger,
        private readonly string $mode,
        private readonly string $apiKey,
        private readonly string $apiSecret,
        private readonly string $targetPayment,
        ?HttpClientInterface $client = null,
    ) {
        $this->client = $client ?? HttpClient::create();
    }

    public function supports(string $provider): bool
    {
        return $provider === 'paytech';
    }

    public function createIntent(PaymentIntentPayload $payload): PaymentIntentResult
    {
        $requestPayload = [
            'item_name' => 'Contribution Sunu Cagnotte',
            'item_price' => (float) $payload->amount,
            'currency' => strtoupper($payload->currency),
            'ref_command' => $payload->reference,
            'command_name' => $payload->description,
            'env' => $this->mode,
            'ipn_url' => $payload->callbackUrl,
            'success_url' => $payload->returnUrl,
            'cancel_url' => $payload->returnUrl,
            'custom_field' => json_encode([
                'reference' => $payload->reference,
                'customer_name' => $payload->customerName,
                'customer_email' => $payload->customerEmail,
                'customer_phone' => $payload->customerPhone,
            ], JSON_THROW_ON_ERROR),
        ];

        $targetPayment = trim($this->targetPayment);

        if ($targetPayment !== '') {
            $requestPayload['target_payment'] = $targetPayment;
        }

        $this->logger->info('PayTech intent request.', [
            'mode' => $this->mode,
            'reference' => $payload->reference,
            'target_payment' => $targetPayment !== '' ? $targetPayment : null,
        ]);

        $response = $this->client->request('POST', self::API_BASE_URL.'/payment/request-payment', [
            'headers' => $this->buildHeaders(),
            'json' => $requestPayload,
        ]);

        $statusCode = $response->getStatusCode();
        $data = $response->toArray(false);

        if ($statusCode >= 400 || (int) ($data['success'] ?? 0) !== 1) {
            $this->logger->error('PayTech intent failed.', [
                'status_code' => $statusCode,
                'response' => $data,
            ]);

            throw new \RuntimeException((string) ($data['message'] ?? 'PayTech checkout creation failed.'));
        }

        $redirectUrl = trim((string) ($data['redirect_url'] ?? $data['redirectUrl'] ?? ''));
        $token = trim((string) ($data['token'] ?? ''));

        if ($redirectUrl === '' || $token === '') {
            throw new \RuntimeException('PayTech response is missing redirect URL or token.');
        }

        return new PaymentIntentResult(
            provider: 'paytech',
            reference: $payload->reference,
            redirectUrl: $redirectUrl,
            providerTransactionId: $token,
            raw: $data,
        );
    }

    public function verify(array $payload): PaymentVerificationResult
    {
        if ($this->isSimulationPayload($payload)) {
            return $this->buildVerificationResultFromStatus(
                (string) ($payload['status'] ?? 'pending'),
                (string) ($payload['transaction_id'] ?? $payload['token'] ?? ''),
                $payload,
                $payload['fee_amount'] ?? null,
            );
        }

        if ($this->isIpnPayload($payload)) {
            $this->assertIpnAuthenticity($payload);

            return $this->buildVerificationResultFromStatus(
                (string) ($payload['type_event'] ?? 'pending'),
                (string) ($payload['token'] ?? ''),
                $payload,
                $payload['fee_amount'] ?? $payload['fees'] ?? null,
            );
        }

        $token = $this->extractToken($payload);

        if ($token === null) {
            throw new \RuntimeException('PayTech token is missing.');
        }

        $endpoint = self::API_BASE_URL.'/payment/get-status?token_payment='.rawurlencode($token);

        $this->logger->info('PayTech verification request.', [
            'payload' => $payload,
            'endpoint' => $endpoint,
        ]);

        $response = $this->client->request('GET', $endpoint, [
            'headers' => $this->buildHeaders(false),
        ]);
        $statusCode = $response->getStatusCode();
        $data = $response->toArray(false);

        if ($statusCode >= 400 || (isset($data['success']) && (int) $data['success'] !== 1)) {
            $this->logger->error('PayTech confirmation failed.', [
                'status_code' => $statusCode,
                'response' => $data,
            ]);

            throw new \RuntimeException((string) ($data['message'] ?? 'PayTech payment confirmation failed.'));
        }

        $paymentData = $this->extractPaymentData($data);
        $remoteStatus = (string) (
            $paymentData['state']
            ?? $paymentData['status']
            ?? $paymentData['payment_status']
            ?? $paymentData['type_event']
            ?? $data['state']
            ?? $data['status']
            ?? $data['payment_status']
            ?? $data['type_event']
            ?? 'pending'
        );

        return $this->buildVerificationResultFromStatus(
            $remoteStatus,
            (string) ($paymentData['token'] ?? $paymentData['token_payment'] ?? $token),
            $data,
            $paymentData['fee'] ?? $paymentData['fees'] ?? $data['fee'] ?? $data['fees'] ?? null,
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function extractPaymentData(array $data): array
    {
        foreach (['payment', 'data', 'transaction'] as $key) {
            $candidate = $data[$key] ?? null;

            if (is_array($candidate)) {
                return $candidate;
            }
        }

        return $data;
    }

    /**
     * @return array<string, string>
     */
    private function buildHeaders(bool $includeContentType = true): array
    {
        $headers = [
            'Accept' => 'application/json',
            'API_KEY' => $this->apiKey,
            'API_SECRET' => $this->apiSecret,
        ];

        if ($includeContentType) {
            $headers['Content-Type'] = 'application/json';
        }

        return $headers;
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function isSimulationPayload(array $payload): bool
    {
        return isset($payload['event'], $payload['status']) && $payload['event'] === 'simulated_ipn';
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function isIpnPayload(array $payload): bool
    {
        return isset($payload['type_event']) || isset($payload['hmac_compute']) || isset($payload['api_key_sha256']);
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function assertIpnAuthenticity(array $payload): void
    {
        $hmac = trim((string) ($payload['hmac_compute'] ?? ''));

        if ($hmac !== '') {
            $amount = (string) ($payload['final_item_price'] ?? $payload['item_price'] ?? '');
            $reference = trim((string) ($payload['ref_command'] ?? ''));
            $message = sprintf('%s|%s|%s', $amount, $reference, $this->apiKey);
            $expectedHmac = hash_hmac('sha256', $message, $this->apiSecret);

            if (!hash_equals($expectedHmac, $hmac)) {
                throw new \RuntimeException('PayTech HMAC verification failed.');
            }

            return;
        }

        $apiKeySha256 = trim((string) ($payload['api_key_sha256'] ?? ''));
        $apiSecretSha256 = trim((string) ($payload['api_secret_sha256'] ?? ''));

        if ($apiKeySha256 === '' || $apiSecretSha256 === '') {
            throw new \RuntimeException('PayTech IPN signature is missing.');
        }

        if (!hash_equals(hash('sha256', $this->apiKey), $apiKeySha256)
            || !hash_equals(hash('sha256', $this->apiSecret), $apiSecretSha256)) {
            throw new \RuntimeException('PayTech SHA256 verification failed.');
        }
    }

    /**
     * @param array<string, mixed> $raw
     */
    private function buildVerificationResultFromStatus(
        string $status,
        string $providerTransactionId,
        array $raw,
        mixed $providerFeeAmount = null,
    ): PaymentVerificationResult {
        $normalizedStatus = strtolower(trim($status));

        [$confirmed, $mappedStatus] = match ($normalizedStatus) {
            'paid', 'completed', 'complete', 'success', 'successful', 'sale_complete' => [true, ContributionStatus::Paid],
            'failed', 'error', 'rejected' => [false, ContributionStatus::Failed],
            'cancelled', 'canceled', 'cancel', 'sale_canceled' => [false, ContributionStatus::Cancelled],
            default => [false, ContributionStatus::Pending],
        };

        $fee = null;

        if ($providerFeeAmount !== null && $providerFeeAmount !== '') {
            $fee = number_format((float) $providerFeeAmount, 2, '.', '');
        }

        return new PaymentVerificationResult(
            confirmed: $confirmed,
            status: $mappedStatus,
            providerTransactionId: $providerTransactionId !== '' ? $providerTransactionId : null,
            providerFeeAmount: $fee,
            raw: $raw,
        );
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function extractToken(array $payload): ?string
    {
        $token = $payload['token']
            ?? $payload['token_payment']
            ?? $payload['payment']['token']
            ?? $payload['payment']['token_payment']
            ?? $payload['data']['token']
            ?? $payload['data']['token_payment']
            ?? null;

        if (!is_string($token)) {
            return null;
        }

        $token = trim($token);

        return $token !== '' ? $token : null;
    }
}
