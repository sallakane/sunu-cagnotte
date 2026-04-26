<?php

namespace App\Controller;

use App\Entity\Contribution;
use App\Entity\Fundraiser;
use App\Enum\AdminValidationStatus;
use App\Enum\FundraiserStatus;
use App\Repository\ContributionRepository;
use App\Repository\FundraiserRepository;
use App\Service\Admin\AdminContributionViewFactory;
use App\Service\Admin\AdminFundraiserViewFactory;
use App\Service\Mailer\TransactionalMailer;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/admin')]
class AdminController extends AbstractController
{
    #[Route('/users', name: 'api_admin_users', methods: ['GET'])]
    public function users(): JsonResponse
    {
        return $this->json(['items' => []]);
    }

    #[Route('/fundraisers', name: 'api_admin_fundraisers', methods: ['GET'])]
    public function fundraisers(
        Request $request,
        FundraiserRepository $fundraiserRepository,
        AdminFundraiserViewFactory $adminFundraiserViewFactory,
    ): JsonResponse
    {
        $status = $request->query->get('status');
        $items = array_map(
            $adminFundraiserViewFactory->build(...),
            $fundraiserRepository->findForAdmin(is_string($status) ? $status : null),
        );

        return $this->json([
            'items' => $items,
        ]);
    }

    #[Route('/fundraisers/{id}/approve', name: 'api_admin_fundraiser_approve', methods: ['PATCH'])]
    public function approve(
        string $id,
        FundraiserRepository $fundraiserRepository,
        EntityManagerInterface $entityManager,
        AdminFundraiserViewFactory $adminFundraiserViewFactory,
        TransactionalMailer $mailer,
    ): JsonResponse
    {
        $fundraiser = $fundraiserRepository->findOneById($id);

        if (!$fundraiser instanceof Fundraiser) {
            return $this->json([
                'message' => 'Cagnotte introuvable.',
            ], Response::HTTP_NOT_FOUND);
        }

        if ($fundraiser->getStatus() !== FundraiserStatus::PendingReview) {
            return $this->json([
                'message' => 'Seules les cagnottes en attente peuvent etre approuvees.',
            ], Response::HTTP_CONFLICT);
        }

        $fundraiser
            ->setStatus(FundraiserStatus::Published)
            ->setAdminValidationStatus(AdminValidationStatus::Approved)
            ->setAdminValidationComment(null)
            ->setPublishedAt(new \DateTimeImmutable());

        $entityManager->flush();
        $mailer->sendFundraiserApproved($fundraiser);

        return $this->json([
            'message' => 'Cagnotte approuvee et publiee.',
            'item' => $adminFundraiserViewFactory->build($fundraiser),
        ]);
    }

    #[Route('/fundraisers/{id}/reject', name: 'api_admin_fundraiser_reject', methods: ['PATCH'])]
    public function reject(
        string $id,
        Request $request,
        FundraiserRepository $fundraiserRepository,
        EntityManagerInterface $entityManager,
        AdminFundraiserViewFactory $adminFundraiserViewFactory,
    ): JsonResponse
    {
        $fundraiser = $fundraiserRepository->findOneById($id);

        if (!$fundraiser instanceof Fundraiser) {
            return $this->json([
                'message' => 'Cagnotte introuvable.',
            ], Response::HTTP_NOT_FOUND);
        }

        if ($fundraiser->getStatus() !== FundraiserStatus::PendingReview) {
            return $this->json([
                'message' => 'Seules les cagnottes en attente peuvent etre refusees.',
            ], Response::HTTP_CONFLICT);
        }

        $payload = json_decode($request->getContent() ?: '{}', true);
        $comment = trim((string) (($payload['comment'] ?? '')));

        $fundraiser
            ->setStatus(FundraiserStatus::Rejected)
            ->setAdminValidationStatus(AdminValidationStatus::Rejected)
            ->setAdminValidationComment($comment !== '' ? $comment : null)
            ->setPublishedAt(null);

        $entityManager->flush();

        return $this->json([
            'message' => 'Cagnotte refusee.',
            'item' => $adminFundraiserViewFactory->build($fundraiser),
        ]);
    }

    #[Route('/fundraisers/{id}', name: 'api_admin_fundraiser_edit', methods: ['PUT'])]
    public function edit(
        string $id,
        Request $request,
        FundraiserRepository $fundraiserRepository,
        EntityManagerInterface $entityManager,
        AdminFundraiserViewFactory $adminFundraiserViewFactory,
    ): JsonResponse
    {
        $fundraiser = $fundraiserRepository->findOneById($id);

        if (!$fundraiser instanceof Fundraiser) {
            return $this->json([
                'message' => 'Cagnotte introuvable.',
            ], Response::HTTP_NOT_FOUND);
        }

        $payload = json_decode($request->getContent() ?: '{}', true);

        if (isset($payload['title']) && is_string($payload['title']) && trim($payload['title']) !== '') {
            $fundraiser->setTitle(trim($payload['title']));
        }
        if (isset($payload['description']) && is_string($payload['description']) && trim($payload['description']) !== '') {
            $fundraiser->setDescription(trim($payload['description']));
        }
        if (array_key_exists('category', $payload)) {
            $category = is_string($payload['category']) ? trim($payload['category']) : null;
            $fundraiser->setCategory($category !== '' ? $category : null);
        }
        if (isset($payload['targetAmount']) && is_numeric($payload['targetAmount'])) {
            $fundraiser->setTargetAmount((string) $payload['targetAmount']);
        }
        if (isset($payload['endDate']) && is_string($payload['endDate'])) {
            try {
                $fundraiser->setEndDate(new \DateTimeImmutable($payload['endDate']));
            } catch (\Exception) {
                return $this->json([
                    'message' => 'Date de fin invalide.',
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        $entityManager->flush();

        return $this->json([
            'message' => 'Cagnotte modifiée.',
            'item' => $adminFundraiserViewFactory->build($fundraiser),
        ]);
    }

    #[Route('/fundraisers/{id}/invalidate', name: 'api_admin_fundraiser_invalidate', methods: ['PATCH'])]
    public function invalidate(
        string $id,
        Request $request,
        FundraiserRepository $fundraiserRepository,
        EntityManagerInterface $entityManager,
        AdminFundraiserViewFactory $adminFundraiserViewFactory,
    ): JsonResponse
    {
        $fundraiser = $fundraiserRepository->findOneById($id);

        if (!$fundraiser instanceof Fundraiser) {
            return $this->json([
                'message' => 'Cagnotte introuvable.',
            ], Response::HTTP_NOT_FOUND);
        }

        $invalidatableStatuses = [FundraiserStatus::Published, FundraiserStatus::Completed];
        if (!in_array($fundraiser->getStatus(), $invalidatableStatuses, true)) {
            return $this->json([
                'message' => 'Seules les cagnottes publiées ou terminées peuvent être invalidées.',
            ], Response::HTTP_CONFLICT);
        }

        $payload = json_decode($request->getContent() ?: '{}', true);
        $comment = trim((string) ($payload['comment'] ?? ''));

        $fundraiser
            ->setStatus(FundraiserStatus::Archived)
            ->setAdminValidationStatus(AdminValidationStatus::Rejected)
            ->setAdminValidationComment($comment !== '' ? $comment : null)
            ->setPublishedAt(null);

        $entityManager->flush();

        return $this->json([
            'message' => 'Cagnotte invalidée et dépubliée.',
            'item' => $adminFundraiserViewFactory->build($fundraiser),
        ]);
    }

    #[Route('/contributions', name: 'api_admin_contributions', methods: ['GET'])]
    public function contributions(
        Request $request,
        ContributionRepository $contributionRepository,
        AdminContributionViewFactory $adminContributionViewFactory,
    ): JsonResponse
    {
        $status = $request->query->get('status');
        $fundraiserId = $request->query->get('fundraiserId');
        $items = array_map(
            $adminContributionViewFactory->build(...),
            $contributionRepository->findAllForAdmin(
                is_string($status) ? $status : null,
                is_string($fundraiserId) ? $fundraiserId : null,
            ),
        );

        return $this->json(['items' => $items]);
    }

    #[Route('/contributions/{id}', name: 'api_admin_contribution_edit', methods: ['PUT'])]
    public function editContribution(
        string $id,
        Request $request,
        ContributionRepository $contributionRepository,
        EntityManagerInterface $entityManager,
        AdminContributionViewFactory $adminContributionViewFactory,
    ): JsonResponse
    {
        $contribution = $contributionRepository->findOneById($id);

        if (!$contribution instanceof Contribution) {
            return $this->json(['message' => 'Don introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $payload = json_decode($request->getContent() ?: '{}', true);

        if (isset($payload['firstName']) && is_string($payload['firstName']) && trim($payload['firstName']) !== '') {
            $contribution->setFirstName(trim($payload['firstName']));
        }
        if (isset($payload['lastName']) && is_string($payload['lastName']) && trim($payload['lastName']) !== '') {
            $contribution->setLastName(trim($payload['lastName']));
        }
        if (isset($payload['email']) && is_string($payload['email']) && trim($payload['email']) !== '') {
            $contribution->setEmail(trim($payload['email']));
        }
        if (isset($payload['phone']) && is_string($payload['phone'])) {
            $contribution->setPhone(trim($payload['phone']));
        }
        if (array_key_exists('publicDisplayName', $payload)) {
            $name = is_string($payload['publicDisplayName']) ? trim($payload['publicDisplayName']) : null;
            $contribution->setPublicDisplayName($name !== '' ? $name : null);
        }
        if (array_key_exists('message', $payload)) {
            $message = is_string($payload['message']) ? trim($payload['message']) : null;
            $contribution->setMessage($message !== '' ? $message : null);
        }
        if (array_key_exists('isAnonymous', $payload) && is_bool($payload['isAnonymous'])) {
            $contribution->setIsAnonymous($payload['isAnonymous']);
        }

        $entityManager->flush();

        return $this->json([
            'message' => 'Don modifié.',
            'item' => $adminContributionViewFactory->build($contribution),
        ]);
    }

    #[Route('/contact-messages', name: 'api_admin_contact_messages', methods: ['GET'])]
    public function contactMessages(): JsonResponse
    {
        return $this->json(['items' => []]);
    }
}
