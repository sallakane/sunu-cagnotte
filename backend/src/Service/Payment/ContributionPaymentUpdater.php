<?php

namespace App\Service\Payment;

use App\Entity\Contribution;
use App\Enum\ContributionStatus;
use App\Service\Fundraiser\FundraiserTotalsUpdater;
use Doctrine\ORM\EntityManagerInterface;

final class ContributionPaymentUpdater
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly FundraiserTotalsUpdater $fundraiserTotalsUpdater,
    ) {
    }

    public function applyVerification(Contribution $contribution, PaymentVerificationResult $verification): void
    {
        $alreadyPaid = $contribution->getStatus() === ContributionStatus::Paid;
        $shouldRefreshFundraiser = false;

        if ($verification->providerTransactionId !== null && $contribution->getProviderTransactionId() === null) {
            $contribution->setProviderTransactionId($verification->providerTransactionId);
        }

        if (!$alreadyPaid) {
            $contribution->setStatus($verification->status);

            if ($verification->confirmed && $verification->status === ContributionStatus::Paid) {
                $providerFeeAmount = $verification->providerFeeAmount ?? '0.00';
                $amountNet = max(0, (float) $contribution->getAmountGross() - (float) $providerFeeAmount);

                $contribution
                    ->setPaidAt($contribution->getPaidAt() ?? new \DateTimeImmutable())
                    ->setProviderFeeAmount($providerFeeAmount)
                    ->setAmountNet(number_format($amountNet, 2, '.', ''));

                $shouldRefreshFundraiser = true;
            }
        }

        if ($shouldRefreshFundraiser) {
            $this->entityManager->flush();
            $this->fundraiserTotalsUpdater->refresh($contribution->getFundraiser());
        }

        $this->entityManager->flush();
    }
}
