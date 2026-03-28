<?php

namespace App\Controller;

use App\Entity\Contribution;
use App\Entity\PaymentLog;
use App\Repository\ContributionRepository;
use App\Service\Contribution\ContributionViewFactory;
use App\Service\Mailer\TransactionalMailer;
use App\Service\Payment\ContributionPaymentUpdater;
use App\Service\Payment\PaymentProviderRegistry;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class PaymentController extends AbstractController
{
    #[Route('/api/payments/paydunya/ipn', name: 'api_paydunya_ipn', methods: ['POST'])]
    public function ipn(
        Request $request,
        ContributionRepository $contributionRepository,
        PaymentProviderRegistry $paymentProviderRegistry,
        ContributionPaymentUpdater $contributionPaymentUpdater,
        ContributionViewFactory $contributionViewFactory,
        TransactionalMailer $transactionalMailer,
        EntityManagerInterface $entityManager,
        LoggerInterface $logger,
    ): JsonResponse
    {
        $payload = $this->decodePayload($request);
        $contribution = $this->findContribution($payload, $contributionRepository);

        if ($contribution === null) {
            return $this->json([
                'message' => 'Contribution introuvable.',
            ], Response::HTTP_NOT_FOUND);
        }

        $entityManager->persist(
            (new PaymentLog())
                ->setContribution($contribution)
                ->setProvider($contribution->getPaymentProvider())
                ->setEventType((string) ($payload['event'] ?? 'ipn_received'))
                ->setPayload($payload),
        );

        try {
            $verification = $paymentProviderRegistry->get($contribution->getPaymentProvider())->verify($payload);
        } catch (\Throwable $exception) {
            $entityManager->flush();

            return $this->json([
                'message' => 'Verification PayDunya impossible.',
                'detail' => $exception->getMessage(),
            ], Response::HTTP_BAD_GATEWAY);
        }

        $wasPaid = $contribution->getStatus()->value === 'paid';
        $contributionPaymentUpdater->applyVerification($contribution, $verification);

        if (!$wasPaid && $contribution->getStatus()->value === 'paid') {
            try {
                $transactionalMailer->sendContributionPaid($contribution);
            } catch (\Throwable $exception) {
                $logger->error('Impossible d envoyer l email de confirmation de contribution.', [
                    'exception' => $exception,
                    'contributionId' => $contribution->getId()->toRfc4122(),
                    'fundraiserId' => $contribution->getFundraiser()->getId()->toRfc4122(),
                    'contributorEmail' => $contribution->getEmail(),
                ]);
            }
        }

        return $this->json([
            'message' => 'Notification de paiement prise en compte.',
            'item' => $contributionViewFactory->buildPaymentStatus($contribution),
        ]);
    }

    #[Route('/api/payments/paydunya/return', name: 'api_paydunya_return', methods: ['GET'])]
    public function paymentReturn(
        Request $request,
        ContributionRepository $contributionRepository,
        PaymentProviderRegistry $paymentProviderRegistry,
        ContributionPaymentUpdater $contributionPaymentUpdater,
        ContributionViewFactory $contributionViewFactory,
        TransactionalMailer $transactionalMailer,
        LoggerInterface $logger,
    ): JsonResponse
    {
        $token = trim((string) $request->query->get('token', ''));
        $paymentReference = trim((string) $request->query->get('reference', ''));

        if ($token === '' && $paymentReference === '') {
            return $this->json([
                'message' => 'Le token ou la reference de paiement est obligatoire.',
            ], Response::HTTP_BAD_REQUEST);
        }

        $contribution = $token !== ''
            ? $contributionRepository->findOneByProviderTransactionId($token)
            : $contributionRepository->findOneByPaymentReference($paymentReference);

        if ($contribution === null) {
            return $this->json([
                'message' => 'Contribution introuvable.',
            ], Response::HTTP_NOT_FOUND);
        }

        if ($contribution->getProviderTransactionId() !== null) {
            try {
                $wasPaid = $contribution->getStatus()->value === 'paid';
                $verification = $paymentProviderRegistry->get($contribution->getPaymentProvider())->verify([
                    'token' => $contribution->getProviderTransactionId(),
                ]);

                $contributionPaymentUpdater->applyVerification($contribution, $verification);

                if (!$wasPaid && $contribution->getStatus()->value === 'paid') {
                    try {
                        $transactionalMailer->sendContributionPaid($contribution);
                    } catch (\Throwable $exception) {
                        $logger->error('Impossible d envoyer l email de confirmation de contribution au retour paiement.', [
                            'exception' => $exception,
                            'contributionId' => $contribution->getId()->toRfc4122(),
                            'fundraiserId' => $contribution->getFundraiser()->getId()->toRfc4122(),
                            'contributorEmail' => $contribution->getEmail(),
                        ]);
                    }
                }
            } catch (\Throwable) {
                // In local development, the browser return can still display the stored state
                // even if remote confirmation is temporarily unavailable.
            }
        }

        return $this->json([
            'item' => $contributionViewFactory->buildPaymentStatus($contribution),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function decodePayload(Request $request): array
    {
        $formPayload = $request->request->all();

        if ($formPayload !== []) {
            return is_array($formPayload) ? $formPayload : [];
        }

        $content = trim((string) $request->getContent());

        if ($content === '') {
            return [];
        }

        try {
            $payload = json_decode($content, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            return [];
        }

        return is_array($payload) ? $payload : [];
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function findContribution(array $payload, ContributionRepository $contributionRepository): ?Contribution
    {
        $token = $payload['token']
            ?? $payload['data']['invoice']['token']
            ?? $payload['invoice']['token']
            ?? null;

        if (is_string($token)) {
            $token = trim($token);

            if ($token !== '') {
                $contribution = $contributionRepository->findOneByProviderTransactionId($token);

                if ($contribution !== null) {
                    return $contribution;
                }
            }
        }

        $reference = $payload['reference']
            ?? $payload['data']['custom_data']['reference']
            ?? $payload['custom_data']['reference']
            ?? null;

        if (!is_string($reference)) {
            return null;
        }

        $reference = trim($reference);

        if ($reference === '') {
            return null;
        }

        return $contributionRepository->findOneByPaymentReference($reference);
    }
}
