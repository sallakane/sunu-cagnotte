<?php

namespace App\Service\Admin;

use App\Entity\Contribution;

final class AdminContributionViewFactory
{
    public function build(Contribution $contribution): array
    {
        return [
            'id' => $contribution->getId()->toRfc4122(),
            'fundraiser' => [
                'id' => $contribution->getFundraiser()->getId()->toRfc4122(),
                'title' => $contribution->getFundraiser()->getTitle(),
                'slug' => $contribution->getFundraiser()->getSlug(),
            ],
            'firstName' => $contribution->getFirstName(),
            'lastName' => $contribution->getLastName(),
            'email' => $contribution->getEmail(),
            'phone' => $contribution->getPhone(),
            'amountGross' => (float) $contribution->getAmountGross(),
            'amountNet' => $contribution->getAmountNet() !== null ? (float) $contribution->getAmountNet() : null,
            'providerFeeAmount' => $contribution->getProviderFeeAmount() !== null ? (float) $contribution->getProviderFeeAmount() : null,
            'isAnonymous' => $contribution->isAnonymous(),
            'publicDisplayName' => $contribution->getPublicDisplayName(),
            'publicName' => $contribution->getPublicName(),
            'message' => $contribution->getMessage(),
            'paymentProvider' => $contribution->getPaymentProvider(),
            'paymentReference' => $contribution->getPaymentReference(),
            'providerTransactionId' => $contribution->getProviderTransactionId(),
            'status' => $contribution->getStatus()->value,
            'paidAt' => $contribution->getPaidAt()?->format(\DateTimeInterface::ATOM),
            'createdAt' => $contribution->getCreatedAt()->format(\DateTimeInterface::ATOM),
            'updatedAt' => $contribution->getUpdatedAt()->format(\DateTimeInterface::ATOM),
        ];
    }
}
