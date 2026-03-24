<?php

namespace App\Service\Contribution;

use App\Entity\Contribution;

final class ContributionViewFactory
{
    public function buildPublicItem(Contribution $contribution): array
    {
        return [
            'id' => $contribution->getId()->toRfc4122(),
            'displayName' => $contribution->getPublicName(),
            'amount' => (float) $contribution->getAmountGross(),
            'message' => $contribution->getMessage(),
            'paidAt' => $contribution->getPaidAt()?->format(\DateTimeInterface::ATOM),
        ];
    }

    public function buildOwnerItem(Contribution $contribution): array
    {
        return [
            'id' => $contribution->getId()->toRfc4122(),
            'paymentReference' => $contribution->getPaymentReference(),
            'status' => $contribution->getStatus()->value,
            'firstName' => $contribution->getFirstName(),
            'lastName' => $contribution->getLastName(),
            'email' => $contribution->getEmail(),
            'phone' => $contribution->getPhone(),
            'displayName' => $contribution->getPublicName(),
            'amountGross' => (float) $contribution->getAmountGross(),
            'amountNet' => $contribution->getAmountNet() !== null ? (float) $contribution->getAmountNet() : null,
            'providerFeeAmount' => $contribution->getProviderFeeAmount() !== null ? (float) $contribution->getProviderFeeAmount() : null,
            'message' => $contribution->getMessage(),
            'isAnonymous' => $contribution->isAnonymous(),
            'paymentProvider' => $contribution->getPaymentProvider(),
            'providerTransactionId' => $contribution->getProviderTransactionId(),
            'paidAt' => $contribution->getPaidAt()?->format(\DateTimeInterface::ATOM),
            'createdAt' => $contribution->getCreatedAt()->format(\DateTimeInterface::ATOM),
        ];
    }

    public function buildPaymentStatus(Contribution $contribution): array
    {
        return [
            'id' => $contribution->getId()->toRfc4122(),
            'paymentReference' => $contribution->getPaymentReference(),
            'status' => $contribution->getStatus()->value,
            'amountGross' => (float) $contribution->getAmountGross(),
            'amountNet' => $contribution->getAmountNet() !== null ? (float) $contribution->getAmountNet() : null,
            'providerFeeAmount' => $contribution->getProviderFeeAmount() !== null ? (float) $contribution->getProviderFeeAmount() : null,
            'paymentProvider' => $contribution->getPaymentProvider(),
            'providerTransactionId' => $contribution->getProviderTransactionId(),
            'paidAt' => $contribution->getPaidAt()?->format(\DateTimeInterface::ATOM),
            'fundraiser' => [
                'id' => $contribution->getFundraiser()->getId()->toRfc4122(),
                'slug' => $contribution->getFundraiser()->getSlug(),
                'title' => $contribution->getFundraiser()->getTitle(),
            ],
        ];
    }
}
