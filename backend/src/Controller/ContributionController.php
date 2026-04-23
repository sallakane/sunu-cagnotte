<?php

namespace App\Controller;

use App\Entity\Contribution;
use App\Entity\PaymentLog;
use App\Enum\ContributionStatus;
use App\Repository\FundraiserRepository;
use App\Service\Contribution\ContributionReferenceGenerator;
use App\Service\Contribution\ContributionViewFactory;
use App\Service\Payment\PaymentIntentPayload;
use App\Service\Payment\PaymentProviderRegistry;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Doctrine\ORM\EntityManagerInterface;

class ContributionController extends AbstractController
{
    private const MINIMUM_CONTRIBUTION_AMOUNT_XOF = 200.0;

    public function __construct(
        private readonly string $paymentProvider,
        private readonly string $appBaseUrl,
        private readonly string $frontendBaseUrl,
    ) {
    }

    #[Route('/api/fundraisers/{id}/contributions/initiate', name: 'api_contribution_initiate', methods: ['POST'])]
    public function initiate(
        string $id,
        Request $request,
        FundraiserRepository $fundraiserRepository,
        EntityManagerInterface $entityManager,
        ContributionReferenceGenerator $contributionReferenceGenerator,
        ContributionViewFactory $contributionViewFactory,
        PaymentProviderRegistry $paymentProviderRegistry,
    ): JsonResponse {
        $fundraiser = $fundraiserRepository->findContributablePublicById($id);

        if ($fundraiser === null) {
            return $this->json([
                'message' => 'Cette cagnotte n\'est pas disponible pour contribution.',
            ], Response::HTTP_NOT_FOUND);
        }

        try {
            $payload = $this->decodeJsonPayload($request);
        } catch (\JsonException) {
            return $this->json([
                'message' => 'Le payload JSON est invalide.',
            ], Response::HTTP_BAD_REQUEST);
        }

        $validation = $this->validateContributionPayload($payload);

        if ($validation['errors'] !== []) {
            return $this->json([
                'message' => 'Validation impossible.',
                'errors' => $validation['errors'],
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $paymentReference = $contributionReferenceGenerator->generate();
        $paymentReturnUrl = sprintf(
            '%s/paiement/retour?reference=%s',
            rtrim($this->frontendBaseUrl, '/'),
            rawurlencode($paymentReference),
        );
        $contribution = (new Contribution())
            ->setFundraiser($fundraiser)
            ->setFirstName($validation['firstName'])
            ->setLastName($validation['lastName'])
            ->setEmail($validation['email'])
            ->setPhone($validation['phone'])
            ->setAmountGross($validation['amountGross'])
            ->setAmountNet(null)
            ->setProviderFeeAmount(null)
            ->setIsAnonymous($validation['isAnonymous'])
            ->setPublicDisplayName($validation['publicDisplayName'])
            ->setMessage($validation['message'])
            ->setPaymentProvider($this->paymentProvider)
            ->setPaymentReference($paymentReference)
            ->setStatus(ContributionStatus::Initiated);

        $entityManager->persist($contribution);

        $provider = $paymentProviderRegistry->get($this->paymentProvider);

        try {
            $intent = $provider->createIntent(new PaymentIntentPayload(
                reference: $paymentReference,
                amount: $validation['amountGross'],
                currency: $fundraiser->getCurrency(),
                description: sprintf('Contribution a la cagnotte %s', $fundraiser->getTitle()),
                customerName: trim(sprintf('%s %s', $validation['firstName'], $validation['lastName'])),
                customerEmail: $validation['email'],
                customerPhone: $validation['phone'],
                returnUrl: $paymentReturnUrl,
                callbackUrl: sprintf(
                    '%s/api/payments/ipn',
                    rtrim($this->appBaseUrl, '/'),
                ),
            ));

            $contribution
                ->setStatus(ContributionStatus::Pending)
                ->setProviderTransactionId($intent->providerTransactionId);

            $entityManager->persist(
                (new PaymentLog())
                    ->setContribution($contribution)
                    ->setProvider($this->paymentProvider)
                    ->setEventType('intent_created')
                    ->setPayload($intent->raw),
            );

            $entityManager->flush();
        } catch (\Throwable $exception) {
            $contribution->setStatus(ContributionStatus::Failed);

            $entityManager->persist(
                (new PaymentLog())
                    ->setContribution($contribution)
                    ->setProvider($this->paymentProvider)
                    ->setEventType('intent_failed')
                    ->setPayload([
                        'message' => $exception->getMessage(),
                    ]),
            );

            $entityManager->flush();

            return $this->json([
                'message' => $exception->getMessage() !== ''
                    ? $exception->getMessage()
                    : 'Le paiement n\'a pas pu etre initialise.',
            ], Response::HTTP_BAD_GATEWAY);
        }

        return $this->json([
            'message' => 'Contribution initiee. Redirection vers le paiement.',
            'item' => $contributionViewFactory->buildPaymentStatus($contribution),
            'payment' => [
                'provider' => $intent->provider,
                'reference' => $intent->reference,
                'redirectUrl' => $intent->redirectUrl,
                'raw' => $intent->raw,
            ],
        ], Response::HTTP_CREATED);
    }

    /**
     * @return array<string, mixed>
     */
    private function decodeJsonPayload(Request $request): array
    {
        $content = trim($request->getContent());

        if ($content === '') {
            return [];
        }

        $payload = json_decode($content, true, 512, JSON_THROW_ON_ERROR);

        return is_array($payload) ? $payload : [];
    }

    /**
     * @param array<string, mixed> $payload
     *
     * @return array{errors: array<string, string>, firstName: string, lastName: string, email: string, phone: string, amountGross: string, isAnonymous: bool, publicDisplayName: ?string, message: ?string}
     */
    private function validateContributionPayload(array $payload): array
    {
        $errors = [];
        $firstName = trim((string) ($payload['firstName'] ?? ''));
        $lastName = trim((string) ($payload['lastName'] ?? ''));
        $email = mb_strtolower(trim((string) ($payload['email'] ?? '')));
        $phone = trim((string) ($payload['phone'] ?? ''));
        $amountRaw = str_replace(',', '.', trim((string) ($payload['amount'] ?? '')));
        $isAnonymous = (bool) ($payload['isAnonymous'] ?? false);
        $message = trim((string) ($payload['message'] ?? ''));
        $acceptLegal = (bool) ($payload['acceptLegal'] ?? false);

        if ($firstName === '') {
            $errors['firstName'] = 'Le prenom est obligatoire.';
        }

        if ($lastName === '') {
            $errors['lastName'] = 'Le nom est obligatoire.';
        }

        if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
            $errors['email'] = 'Si vous renseignez un email, il doit etre valide.';
        }

        if ($phone !== '' && mb_strlen($phone) < 6) {
            $errors['phone'] = 'Si vous renseignez un telephone, il doit etre valide.';
        }

        if ($amountRaw === '' || !is_numeric($amountRaw) || (float) $amountRaw <= 0) {
            $errors['amount'] = 'Le montant doit etre un nombre positif.';
        } elseif ((float) $amountRaw < self::MINIMUM_CONTRIBUTION_AMOUNT_XOF) {
            $errors['amount'] = sprintf(
                'Le montant minimum pour un paiement est de %.0f FCFA.',
                self::MINIMUM_CONTRIBUTION_AMOUNT_XOF,
            );
        }

        if (!$acceptLegal) {
            $errors['acceptLegal'] = 'Vous devez accepter les CGU et la politique de confidentialite.';
        }

        if (mb_strlen($message) > 500) {
            $errors['message'] = 'Le message ne peut pas depasser 500 caracteres.';
        }

        $publicDisplayName = $isAnonymous
            ? null
            : trim(sprintf('%s %s.', $firstName, mb_substr($lastName, 0, 1)));

        return [
            'errors' => $errors,
            'firstName' => $firstName,
            'lastName' => $lastName,
            'email' => $email,
            'phone' => $phone,
            'amountGross' => number_format((float) $amountRaw, 2, '.', ''),
            'isAnonymous' => $isAnonymous,
            'publicDisplayName' => $publicDisplayName,
            'message' => $message !== '' ? $message : null,
        ];
    }
}
