<?php

namespace App\Entity;

use App\Repository\PaymentLogRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: PaymentLogRepository::class)]
#[ORM\HasLifecycleCallbacks]
class PaymentLog
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    private Uuid $id;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private Contribution $contribution;

    #[ORM\Column(length: 50)]
    private string $provider;

    #[ORM\Column(length: 100)]
    private string $eventType;

    #[ORM\Column(type: 'json')]
    private array $payload = [];

    #[ORM\Column]
    private \DateTimeImmutable $receivedAt;

    #[ORM\PrePersist]
    public function initialize(): void
    {
        $this->id = Uuid::v7();
        $this->receivedAt = new \DateTimeImmutable();
    }

    public function setContribution(Contribution $contribution): self
    {
        $this->contribution = $contribution;

        return $this;
    }

    public function setProvider(string $provider): self
    {
        $this->provider = $provider;

        return $this;
    }

    public function setEventType(string $eventType): self
    {
        $this->eventType = $eventType;

        return $this;
    }

    /**
     * @param array<string, mixed> $payload
     */
    public function setPayload(array $payload): self
    {
        $this->payload = $payload;

        return $this;
    }
}
