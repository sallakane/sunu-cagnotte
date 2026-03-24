<?php

namespace App\Service\Admin;

use App\Entity\Fundraiser;
use App\Service\Fundraiser\FundraiserViewFactory;

final class AdminFundraiserViewFactory
{
    public function __construct(
        private readonly FundraiserViewFactory $fundraiserViewFactory,
    ) {
    }

    public function build(Fundraiser $fundraiser): array
    {
        return [
            ...$this->fundraiserViewFactory->buildOwnerSummary($fundraiser),
            'owner' => [
                'id' => $fundraiser->getOwner()->getId()->toRfc4122(),
                'firstName' => $fundraiser->getOwner()->getFirstName(),
                'lastName' => $fundraiser->getOwner()->getLastName(),
                'email' => $fundraiser->getOwner()->getEmail(),
                'phone' => $fundraiser->getOwner()->getPhone(),
            ],
        ];
    }
}

