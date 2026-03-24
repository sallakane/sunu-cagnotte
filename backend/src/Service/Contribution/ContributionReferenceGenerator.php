<?php

namespace App\Service\Contribution;

final class ContributionReferenceGenerator
{
    public function generate(): string
    {
        return sprintf(
            'CS-%s-%s',
            (new \DateTimeImmutable())->format('YmdHis'),
            strtoupper(bin2hex(random_bytes(4))),
        );
    }
}
