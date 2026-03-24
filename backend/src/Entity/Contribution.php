<?php

namespace App\Entity;

use App\Entity\Traits\TimestampableTrait;
use App\Entity\Traits\UuidTrait;
use App\Enum\ContributionStatus;
use App\Repository\ContributionRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ContributionRepository::class)]
#[ORM\HasLifecycleCallbacks]
class Contribution
{
    use TimestampableTrait;
    use UuidTrait;

    #[ORM\ManyToOne(inversedBy: 'contributions')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private Fundraiser $fundraiser;

    #[ORM\Column(length: 120)]
    private string $firstName;

    #[ORM\Column(length: 120)]
    private string $lastName;

    #[ORM\Column(length: 180)]
    private string $email;

    #[ORM\Column(length: 40)]
    private string $phone;

    #[ORM\Column(type: 'decimal', precision: 12, scale: 2)]
    private string $amountGross;

    #[ORM\Column(type: 'decimal', precision: 12, scale: 2, nullable: true)]
    private ?string $amountNet = null;

    #[ORM\Column(type: 'decimal', precision: 12, scale: 2, nullable: true)]
    private ?string $providerFeeAmount = null;

    #[ORM\Column]
    private bool $isAnonymous = false;

    #[ORM\Column(length: 120, nullable: true)]
    private ?string $publicDisplayName = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $message = null;

    #[ORM\Column(length: 50)]
    private string $paymentProvider = 'paydunya';

    #[ORM\Column(length: 120, name: 'payment_reference')]
    private string $paymentReference;

    #[ORM\Column(length: 120, nullable: true)]
    private ?string $providerTransactionId = null;

    #[ORM\Column(enumType: ContributionStatus::class, length: 32)]
    private ContributionStatus $status = ContributionStatus::Initiated;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $paidAt = null;

    public function getFirstName(): string
    {
        return $this->firstName;
    }

    public function setFirstName(string $firstName): self
    {
        $this->firstName = $firstName;

        return $this;
    }

    public function getLastName(): string
    {
        return $this->lastName;
    }

    public function setLastName(string $lastName): self
    {
        $this->lastName = $lastName;

        return $this;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = mb_strtolower($email);

        return $this;
    }

    public function getPhone(): string
    {
        return $this->phone;
    }

    public function setPhone(string $phone): self
    {
        $this->phone = $phone;

        return $this;
    }

    public function getAmountGross(): string
    {
        return $this->amountGross;
    }

    public function setAmountGross(string $amountGross): self
    {
        $this->amountGross = $amountGross;

        return $this;
    }

    public function getAmountNet(): ?string
    {
        return $this->amountNet;
    }

    public function setAmountNet(?string $amountNet): self
    {
        $this->amountNet = $amountNet;

        return $this;
    }

    public function getProviderFeeAmount(): ?string
    {
        return $this->providerFeeAmount;
    }

    public function setProviderFeeAmount(?string $providerFeeAmount): self
    {
        $this->providerFeeAmount = $providerFeeAmount;

        return $this;
    }

    public function isAnonymous(): bool
    {
        return $this->isAnonymous;
    }

    public function setIsAnonymous(bool $isAnonymous): self
    {
        $this->isAnonymous = $isAnonymous;

        return $this;
    }

    public function getPublicDisplayName(): ?string
    {
        return $this->publicDisplayName;
    }

    public function setPublicDisplayName(?string $publicDisplayName): self
    {
        $this->publicDisplayName = $publicDisplayName;

        return $this;
    }

    public function getMessage(): ?string
    {
        return $this->message;
    }

    public function setMessage(?string $message): self
    {
        $this->message = $message;

        return $this;
    }

    public function getPaymentProvider(): string
    {
        return $this->paymentProvider;
    }

    public function setPaymentProvider(string $paymentProvider): self
    {
        $this->paymentProvider = $paymentProvider;

        return $this;
    }

    public function getFundraiser(): Fundraiser
    {
        return $this->fundraiser;
    }

    public function setFundraiser(Fundraiser $fundraiser): self
    {
        $this->fundraiser = $fundraiser;

        return $this;
    }

    public function getPaymentReference(): string
    {
        return $this->paymentReference;
    }

    public function setPaymentReference(string $paymentReference): self
    {
        $this->paymentReference = $paymentReference;

        return $this;
    }

    public function getProviderTransactionId(): ?string
    {
        return $this->providerTransactionId;
    }

    public function setProviderTransactionId(?string $providerTransactionId): self
    {
        $this->providerTransactionId = $providerTransactionId;

        return $this;
    }

    public function getStatus(): ContributionStatus
    {
        return $this->status;
    }

    public function setStatus(ContributionStatus $status): self
    {
        $this->status = $status;

        return $this;
    }

    public function getPaidAt(): ?\DateTimeImmutable
    {
        return $this->paidAt;
    }

    public function setPaidAt(?\DateTimeImmutable $paidAt): self
    {
        $this->paidAt = $paidAt;

        return $this;
    }

    public function getPublicName(): string
    {
        if ($this->isAnonymous) {
            return 'Donateur anonyme';
        }

        if ($this->publicDisplayName !== null && $this->publicDisplayName !== '') {
            return $this->publicDisplayName;
        }

        $lastInitial = mb_substr($this->lastName, 0, 1);

        return trim(sprintf('%s %s.', $this->firstName, $lastInitial));
    }
}
