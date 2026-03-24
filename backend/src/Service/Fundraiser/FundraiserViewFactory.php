<?php

namespace App\Service\Fundraiser;

use App\Entity\Contribution;
use App\Entity\Fundraiser;
use App\Repository\ContributionRepository;

final class FundraiserViewFactory
{
    public function __construct(
        private readonly ContributionRepository $contributionRepository,
    ) {
    }

    public function buildPublicSummary(Fundraiser $fundraiser): array
    {
        return [
            'id' => $fundraiser->getId()->toRfc4122(),
            'slug' => $fundraiser->getSlug(),
            'title' => $fundraiser->getTitle(),
            'excerpt' => $this->buildExcerpt($fundraiser->getDescription()),
            'description' => $fundraiser->getDescription(),
            'coverImage' => $fundraiser->getCoverImage(),
            'targetAmount' => (float) $fundraiser->getTargetAmount(),
            'collectedAmount' => (float) $fundraiser->getCollectedAmount(),
            'remainingAmount' => $fundraiser->getRemainingAmount(),
            'currency' => $fundraiser->getCurrency(),
            'endDate' => $fundraiser->getEndDate()->format(\DateTimeInterface::ATOM),
            'progressPercentage' => $fundraiser->getProgressPercentage(),
            'contributorCount' => $this->contributionRepository->countPaidForFundraiser($fundraiser),
            'daysRemaining' => $fundraiser->getDaysRemaining(),
            'category' => $fundraiser->getCategory(),
            'createdAt' => $fundraiser->getCreatedAt()->format(\DateTimeInterface::ATOM),
            'publishedAt' => $fundraiser->getPublishedAt()?->format(\DateTimeInterface::ATOM),
        ];
    }

    public function buildPublicDetail(Fundraiser $fundraiser): array
    {
        return [
            ...$this->buildPublicSummary($fundraiser),
            'recentContributions' => array_map(
                fn (Contribution $contribution) => [
                    'id' => $contribution->getId()->toRfc4122(),
                    'displayName' => $contribution->getPublicName(),
                    'amount' => (float) $contribution->getAmountGross(),
                    'message' => $contribution->getMessage(),
                    'paidAt' => $contribution->getPaidAt()?->format(\DateTimeInterface::ATOM),
                ],
                $this->contributionRepository->findRecentPaidPublicByFundraiser($fundraiser, 5),
            ),
        ];
    }

    public function buildOwnerSummary(Fundraiser $fundraiser): array
    {
        return [
            ...$this->buildPublicSummary($fundraiser),
            'status' => $fundraiser->getStatus()->value,
            'adminValidationStatus' => $fundraiser->getAdminValidationStatus()->value,
            'adminValidationComment' => $fundraiser->getAdminValidationComment(),
            'updatedAt' => $fundraiser->getUpdatedAt()->format(\DateTimeInterface::ATOM),
            'isEditable' => $fundraiser->isEditable(),
        ];
    }

    private function buildExcerpt(string $description): string
    {
        $excerpt = trim($description);

        if (mb_strlen($excerpt) <= 160) {
            return $excerpt;
        }

        return rtrim(mb_substr($excerpt, 0, 157)).'...';
    }
}
