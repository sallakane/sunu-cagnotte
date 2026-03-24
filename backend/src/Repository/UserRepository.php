<?php

namespace App\Repository;

use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<User>
 */
class UserRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class);
    }

    public function findOneByEmail(string $email): ?User
    {
        return $this->findOneBy([
            'email' => mb_strtolower($email),
        ]);
    }

    public function findOneByPasswordResetTokenHash(string $tokenHash): ?User
    {
        return $this->findOneBy([
            'passwordResetTokenHash' => $tokenHash,
        ]);
    }
}
