<?php

namespace App\Service\Fundraiser;

use App\Entity\Fundraiser;
use App\Repository\FundraiserRepository;
use Symfony\Component\String\Slugger\AsciiSlugger;

final class FundraiserSlugger
{
    private AsciiSlugger $slugger;

    public function __construct(
        private readonly FundraiserRepository $fundraiserRepository,
    ) {
        $this->slugger = new AsciiSlugger('fr');
    }

    public function generate(string $title, ?Fundraiser $ignore = null): string
    {
        $baseSlug = mb_strtolower($this->slugger->slug($title)->toString());
        $baseSlug = $baseSlug !== '' ? $baseSlug : 'cagnotte';
        $candidate = $baseSlug;
        $suffix = 2;

        while ($this->fundraiserRepository->slugExists($candidate, $ignore)) {
            $candidate = sprintf('%s-%d', $baseSlug, $suffix);
            ++$suffix;
        }

        return $candidate;
    }
}

