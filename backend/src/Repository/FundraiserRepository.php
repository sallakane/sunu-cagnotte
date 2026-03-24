<?php

namespace App\Repository;

use App\Entity\Fundraiser;
use App\Entity\User;
use App\Enum\FundraiserStatus;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Fundraiser>
 */
class FundraiserRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Fundraiser::class);
    }

    /**
     * @return array<int, Fundraiser>
     */
    public function findPublicPublished(?string $search = null, ?string $category = null): array
    {
        $queryBuilder = $this->createQueryBuilder('fundraiser')
            ->andWhere('fundraiser.status = :status')
            ->andWhere('fundraiser.endDate >= :today')
            ->setParameter('status', FundraiserStatus::Published->value)
            ->setParameter('today', new \DateTimeImmutable('today'))
            ->orderBy('fundraiser.publishedAt', 'DESC')
            ->addOrderBy('fundraiser.createdAt', 'DESC');

        if ($search !== null && $search !== '') {
            $queryBuilder
                ->andWhere('LOWER(fundraiser.title) LIKE :search OR LOWER(fundraiser.description) LIKE :search')
                ->setParameter('search', '%'.mb_strtolower($search).'%');
        }

        if ($category !== null && $category !== '') {
            $queryBuilder
                ->andWhere('fundraiser.category = :category')
                ->setParameter('category', $category);
        }

        return $queryBuilder->getQuery()->getResult();
    }

    public function findPublicBySlug(string $slug): ?Fundraiser
    {
        return $this->createQueryBuilder('fundraiser')
            ->andWhere('fundraiser.slug = :slug')
            ->andWhere('fundraiser.status = :status')
            ->setParameter('slug', $slug)
            ->setParameter('status', FundraiserStatus::Published->value)
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findContributablePublicById(string $id): ?Fundraiser
    {
        return $this->createQueryBuilder('fundraiser')
            ->andWhere('fundraiser.id = :id')
            ->andWhere('fundraiser.status = :status')
            ->andWhere('fundraiser.endDate >= :today')
            ->setParameter('id', $id)
            ->setParameter('status', FundraiserStatus::Published->value)
            ->setParameter('today', new \DateTimeImmutable('today'))
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * @return array<int, Fundraiser>
     */
    public function findForAdmin(?string $status = null): array
    {
        $queryBuilder = $this->createQueryBuilder('fundraiser')
            ->leftJoin('fundraiser.owner', 'owner')
            ->addSelect('owner')
            ->orderBy('fundraiser.createdAt', 'DESC');

        if ($status !== null && $status !== '') {
            $queryBuilder
                ->andWhere('fundraiser.status = :status')
                ->setParameter('status', $status);
        }

        return $queryBuilder->getQuery()->getResult();
    }

    public function findOneById(string $id): ?Fundraiser
    {
        return $this->createQueryBuilder('fundraiser')
            ->leftJoin('fundraiser.owner', 'owner')
            ->addSelect('owner')
            ->andWhere('fundraiser.id = :id')
            ->setParameter('id', $id)
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * @return array<int, Fundraiser>
     */
    public function findMine(User $owner): array
    {
        return $this->createQueryBuilder('fundraiser')
            ->andWhere('fundraiser.owner = :owner')
            ->setParameter('owner', $owner)
            ->orderBy('fundraiser.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findOneOwnedById(User $owner, string $id): ?Fundraiser
    {
        return $this->createQueryBuilder('fundraiser')
            ->andWhere('fundraiser.id = :id')
            ->andWhere('fundraiser.owner = :owner')
            ->setParameter('id', $id)
            ->setParameter('owner', $owner)
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function slugExists(string $slug, ?Fundraiser $ignore = null): bool
    {
        $queryBuilder = $this->createQueryBuilder('fundraiser')
            ->select('COUNT(fundraiser.id)')
            ->andWhere('fundraiser.slug = :slug')
            ->setParameter('slug', $slug);

        if ($ignore !== null) {
            $queryBuilder
                ->andWhere('fundraiser.id != :ignoreId')
                ->setParameter('ignoreId', $ignore->getId()->toRfc4122());
        }

        return (int) $queryBuilder->getQuery()->getSingleScalarResult() > 0;
    }

    /**
     * @return array<int, Fundraiser>
     */
    public function findPublishedEndingSoonNeedingAlert(int $days = 3): array
    {
        $today = new \DateTimeImmutable('today');
        $limitDate = $today->modify(sprintf('+%d days', $days))->setTime(23, 59, 59);

        return $this->createQueryBuilder('fundraiser')
            ->leftJoin('fundraiser.owner', 'owner')
            ->addSelect('owner')
            ->andWhere('fundraiser.status = :status')
            ->andWhere('fundraiser.endDate >= :today')
            ->andWhere('fundraiser.endDate <= :limitDate')
            ->andWhere('fundraiser.endingSoonAlertSentAt IS NULL')
            ->setParameter('status', FundraiserStatus::Published->value)
            ->setParameter('today', $today)
            ->setParameter('limitDate', $limitDate)
            ->orderBy('fundraiser.endDate', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
