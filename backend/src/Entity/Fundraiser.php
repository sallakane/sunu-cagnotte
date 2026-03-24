<?php

namespace App\Entity;

use App\Entity\Traits\TimestampableTrait;
use App\Entity\Traits\UuidTrait;
use App\Enum\AdminValidationStatus;
use App\Enum\FundraiserStatus;
use App\Repository\FundraiserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: FundraiserRepository::class)]
#[ORM\HasLifecycleCallbacks]
class Fundraiser
{
    use TimestampableTrait;
    use UuidTrait;

    #[ORM\ManyToOne(inversedBy: 'fundraisers')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private User $owner;

    #[ORM\Column(length: 180)]
    private string $title;

    #[ORM\Column(length: 180)]
    private string $slug;

    #[ORM\Column(type: 'text')]
    private string $description;

    #[ORM\Column(length: 120, nullable: true)]
    private ?string $category = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $coverImage = null;

    #[ORM\Column(type: 'decimal', precision: 12, scale: 2)]
    private string $targetAmount = '0.00';

    #[ORM\Column(type: 'decimal', precision: 12, scale: 2)]
    private string $collectedAmount = '0.00';

    #[ORM\Column(length: 3)]
    private string $currency = 'XOF';

    #[ORM\Column]
    private \DateTimeImmutable $endDate;

    #[ORM\Column(enumType: FundraiserStatus::class, length: 32)]
    private FundraiserStatus $status = FundraiserStatus::Draft;

    #[ORM\Column(enumType: AdminValidationStatus::class, length: 32)]
    private AdminValidationStatus $adminValidationStatus = AdminValidationStatus::Pending;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $adminValidationComment = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $publishedAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $endingSoonAlertSentAt = null;

    /**
     * @var Collection<int, Contribution>
     */
    #[ORM\OneToMany(mappedBy: 'fundraiser', targetEntity: Contribution::class)]
    private Collection $contributions;

    public function __construct()
    {
        $this->contributions = new ArrayCollection();
    }

    public function getOwner(): User
    {
        return $this->owner;
    }

    public function setOwner(User $owner): self
    {
        $this->owner = $owner;

        return $this;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function setTitle(string $title): self
    {
        $this->title = $title;

        return $this;
    }

    public function getSlug(): string
    {
        return $this->slug;
    }

    public function setSlug(string $slug): self
    {
        $this->slug = $slug;

        return $this;
    }

    public function getDescription(): string
    {
        return $this->description;
    }

    public function setDescription(string $description): self
    {
        $this->description = $description;

        return $this;
    }

    public function getCategory(): ?string
    {
        return $this->category;
    }

    public function setCategory(?string $category): self
    {
        $this->category = $category;

        return $this;
    }

    public function getCoverImage(): ?string
    {
        return $this->coverImage;
    }

    public function setCoverImage(?string $coverImage): self
    {
        $this->coverImage = $coverImage;

        return $this;
    }

    public function getTargetAmount(): string
    {
        return $this->targetAmount;
    }

    public function setTargetAmount(string $targetAmount): self
    {
        $this->targetAmount = $targetAmount;

        return $this;
    }

    public function getCollectedAmount(): string
    {
        return $this->collectedAmount;
    }

    public function setCollectedAmount(string $collectedAmount): self
    {
        $this->collectedAmount = $collectedAmount;

        return $this;
    }

    public function getCurrency(): string
    {
        return $this->currency;
    }

    public function setCurrency(string $currency): self
    {
        $this->currency = $currency;

        return $this;
    }

    public function getEndDate(): \DateTimeImmutable
    {
        return $this->endDate;
    }

    public function setEndDate(\DateTimeImmutable $endDate): self
    {
        $this->endDate = $endDate;

        return $this;
    }

    public function getStatus(): FundraiserStatus
    {
        return $this->status;
    }

    public function setStatus(FundraiserStatus $status): self
    {
        $this->status = $status;

        return $this;
    }

    public function getAdminValidationStatus(): AdminValidationStatus
    {
        return $this->adminValidationStatus;
    }

    public function setAdminValidationStatus(AdminValidationStatus $status): self
    {
        $this->adminValidationStatus = $status;

        return $this;
    }

    public function getAdminValidationComment(): ?string
    {
        return $this->adminValidationComment;
    }

    public function setAdminValidationComment(?string $comment): self
    {
        $this->adminValidationComment = $comment;

        return $this;
    }

    public function getPublishedAt(): ?\DateTimeImmutable
    {
        return $this->publishedAt;
    }

    public function setPublishedAt(?\DateTimeImmutable $publishedAt): self
    {
        $this->publishedAt = $publishedAt;

        return $this;
    }

    public function getEndingSoonAlertSentAt(): ?\DateTimeImmutable
    {
        return $this->endingSoonAlertSentAt;
    }

    public function setEndingSoonAlertSentAt(?\DateTimeImmutable $endingSoonAlertSentAt): self
    {
        $this->endingSoonAlertSentAt = $endingSoonAlertSentAt;

        return $this;
    }

    public function getProgressPercentage(): int
    {
        $target = (float) $this->targetAmount;
        $collected = (float) $this->collectedAmount;

        if ($target <= 0) {
            return 0;
        }

        return (int) round(($collected / $target) * 100);
    }

    public function getRemainingAmount(): float
    {
        return max(0, (float) $this->targetAmount - (float) $this->collectedAmount);
    }

    public function getDaysRemaining(): int
    {
        $now = new \DateTimeImmutable('today');
        $diff = $now->diff($this->endDate);

        if ($diff->invert === 1) {
            return 0;
        }

        return (int) $diff->days;
    }

    public function getContributorCount(): int
    {
        return $this->contributions->count();
    }

    public function isEditable(): bool
    {
        return !in_array($this->status, [FundraiserStatus::Completed, FundraiserStatus::Archived], true);
    }

    /**
     * @return Collection<int, Contribution>
     */
    public function getContributions(): Collection
    {
        return $this->contributions;
    }
}
