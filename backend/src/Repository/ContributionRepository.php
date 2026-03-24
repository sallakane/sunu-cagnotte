<?php

namespace App\Repository;

use App\Entity\Contribution;
use App\Entity\Fundraiser;
use App\Enum\ContributionStatus;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Contribution>
 */
class ContributionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Contribution::class);
    }

    public function findOneByPaymentReference(string $paymentReference): ?Contribution
    {
        return $this->createQueryBuilder('contribution')
            ->leftJoin('contribution.fundraiser', 'fundraiser')
            ->addSelect('fundraiser')
            ->andWhere('contribution.paymentReference = :paymentReference')
            ->setParameter('paymentReference', $paymentReference)
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findOneByProviderTransactionId(string $providerTransactionId): ?Contribution
    {
        return $this->createQueryBuilder('contribution')
            ->leftJoin('contribution.fundraiser', 'fundraiser')
            ->addSelect('fundraiser')
            ->andWhere('contribution.providerTransactionId = :providerTransactionId')
            ->setParameter('providerTransactionId', $providerTransactionId)
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function countPaidForFundraiser(Fundraiser $fundraiser): int
    {
        return (int) $this->createQueryBuilder('contribution')
            ->select('COUNT(contribution.id)')
            ->andWhere('contribution.fundraiser = :fundraiser')
            ->andWhere('contribution.status = :status')
            ->setParameter('fundraiser', $fundraiser)
            ->setParameter('status', ContributionStatus::Paid)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function sumPaidAmountForFundraiser(Fundraiser $fundraiser): string
    {
        $amount = $this->createQueryBuilder('contribution')
            ->select('COALESCE(SUM(contribution.amountGross), 0)')
            ->andWhere('contribution.fundraiser = :fundraiser')
            ->andWhere('contribution.status = :status')
            ->setParameter('fundraiser', $fundraiser)
            ->setParameter('status', ContributionStatus::Paid)
            ->getQuery()
            ->getSingleScalarResult();

        return number_format((float) $amount, 2, '.', '');
    }

    /**
     * @return array<int, Contribution>
     */
    public function findRecentPaidPublicByFundraiser(Fundraiser $fundraiser, int $limit = 5): array
    {
        return $this->createQueryBuilder('contribution')
            ->andWhere('contribution.fundraiser = :fundraiser')
            ->andWhere('contribution.status = :status')
            ->setParameter('fundraiser', $fundraiser)
            ->setParameter('status', ContributionStatus::Paid)
            ->orderBy('contribution.paidAt', 'DESC')
            ->addOrderBy('contribution.createdAt', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    /**
     * @return array<int, Contribution>
     */
    public function findAllByFundraiser(Fundraiser $fundraiser): array
    {
        return $this->createQueryBuilder('contribution')
            ->andWhere('contribution.fundraiser = :fundraiser')
            ->setParameter('fundraiser', $fundraiser)
            ->orderBy('contribution.paidAt', 'DESC')
            ->addOrderBy('contribution.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }
}
