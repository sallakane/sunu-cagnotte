<?php

namespace App\Service\Fundraiser;

use App\Entity\Fundraiser;
use App\Repository\ContributionRepository;

final class FundraiserTotalsUpdater
{
    public function __construct(
        private readonly ContributionRepository $contributionRepository,
    ) {
    }

    public function refresh(Fundraiser $fundraiser): void
    {
        $fundraiser->setCollectedAmount(
            $this->contributionRepository->sumPaidAmountForFundraiser($fundraiser),
        );
    }
}
