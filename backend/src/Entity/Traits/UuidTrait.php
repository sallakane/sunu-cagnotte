<?php

namespace App\Entity\Traits;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;

trait UuidTrait
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    private Uuid $id;

    #[ORM\PrePersist]
    public function initializeUuid(): void
    {
        if (!isset($this->id)) {
            $this->id = Uuid::v7();
        }
    }

    public function getId(): Uuid
    {
        return $this->id;
    }
}

