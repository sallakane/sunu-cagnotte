<?php

namespace App\Controller;

use App\Entity\Fundraiser;
use App\Entity\User;
use App\Enum\AdminValidationStatus;
use App\Enum\FundraiserStatus;
use App\Repository\ContributionRepository;
use App\Repository\FundraiserRepository;
use App\Service\Contribution\ContributionViewFactory;
use App\Service\Fundraiser\FundraiserSlugger;
use App\Service\Fundraiser\FundraiserViewFactory;
use App\Service\Mailer\TransactionalMailer;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class FundraiserOwnerController extends AbstractController
{
    private const MAX_COVER_IMAGE_SIZE = 5_242_880;
    private const ALLOWED_CATEGORIES = [
        'Sante',
        'Education',
        'Environnement',
        'Enfance',
        'Religion',
    ];
    private const ALLOWED_COVER_IMAGE_MIME_TYPES = [
        'image/jpeg',
        'image/png',
        'image/webp',
    ];

    #[Route('/api/fundraisers', name: 'api_owner_fundraiser_create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $entityManager,
        FundraiserSlugger $fundraiserSlugger,
        FundraiserViewFactory $fundraiserViewFactory,
        TransactionalMailer $transactionalMailer,
    ): JsonResponse
    {
        $owner = $this->getAuthenticatedUser();

        if (!$owner instanceof User) {
            return $this->json([
                'message' => 'Authentification requise.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        try {
            $payload = $this->decodeJsonPayload($request);
        } catch (\JsonException) {
            return $this->json([
                'message' => 'Le payload JSON est invalide.',
            ], Response::HTTP_BAD_REQUEST);
        }

        $validation = $this->validateFundraiserPayload($payload);

        if ($validation['errors'] !== []) {
            return $this->json([
                'message' => 'Validation impossible.',
                'errors' => $validation['errors'],
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $fundraiser = (new Fundraiser())
            ->setOwner($owner)
            ->setTitle($validation['title'])
            ->setSlug($fundraiserSlugger->generate($validation['title']))
            ->setDescription($validation['description'])
            ->setCategory($validation['category'])
            ->setCoverImage($validation['coverImage'])
            ->setTargetAmount($validation['targetAmount'])
            ->setEndDate($validation['endDate'])
            ->setStatus(FundraiserStatus::Draft)
            ->setAdminValidationStatus(AdminValidationStatus::Pending);

        $entityManager->persist($fundraiser);
        $entityManager->flush();
        $transactionalMailer->sendFundraiserCreated($owner, $fundraiser);

        return $this->json([
            'message' => 'Cagnotte creee en brouillon.',
            'item' => $fundraiserViewFactory->buildOwnerSummary($fundraiser),
        ], Response::HTTP_CREATED);
    }

    #[Route('/api/fundraisers/{id}', name: 'api_owner_fundraiser_update', methods: ['PUT'])]
    public function update(
        string $id,
        Request $request,
        FundraiserRepository $fundraiserRepository,
        EntityManagerInterface $entityManager,
        FundraiserSlugger $fundraiserSlugger,
        FundraiserViewFactory $fundraiserViewFactory,
    ): JsonResponse
    {
        $owner = $this->getAuthenticatedUser();

        if (!$owner instanceof User) {
            return $this->json([
                'message' => 'Authentification requise.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        $fundraiser = $fundraiserRepository->findOneOwnedById($owner, $id);

        if (!$fundraiser instanceof Fundraiser) {
            return $this->json([
                'message' => 'Cagnotte introuvable.',
            ], Response::HTTP_NOT_FOUND);
        }

        if (!$fundraiser->isEditable()) {
            return $this->json([
                'message' => 'Cette cagnotte ne peut plus etre modifiee.',
            ], Response::HTTP_CONFLICT);
        }

        try {
            $payload = $this->decodeJsonPayload($request);
        } catch (\JsonException) {
            return $this->json([
                'message' => 'Le payload JSON est invalide.',
            ], Response::HTTP_BAD_REQUEST);
        }

        $validation = $this->validateFundraiserPayload($payload);

        if ($validation['errors'] !== []) {
            return $this->json([
                'message' => 'Validation impossible.',
                'errors' => $validation['errors'],
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $fundraiser
            ->setTitle($validation['title'])
            ->setSlug($fundraiserSlugger->generate($validation['title'], $fundraiser))
            ->setDescription($validation['description'])
            ->setCategory($validation['category'])
            ->setCoverImage($validation['coverImage'])
            ->setTargetAmount($validation['targetAmount'])
            ->setEndDate($validation['endDate']);

        $entityManager->flush();

        return $this->json([
            'message' => 'Cagnotte mise a jour.',
            'item' => $fundraiserViewFactory->buildOwnerSummary($fundraiser),
        ]);
    }

    #[Route('/api/fundraisers/{id}/submit', name: 'api_owner_fundraiser_submit', methods: ['PATCH'])]
    public function submit(
        string $id,
        FundraiserRepository $fundraiserRepository,
        EntityManagerInterface $entityManager,
        FundraiserViewFactory $fundraiserViewFactory,
    ): JsonResponse
    {
        $owner = $this->getAuthenticatedUser();

        if (!$owner instanceof User) {
            return $this->json([
                'message' => 'Authentification requise.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        $fundraiser = $fundraiserRepository->findOneOwnedById($owner, $id);

        if (!$fundraiser instanceof Fundraiser) {
            return $this->json([
                'message' => 'Cagnotte introuvable.',
            ], Response::HTTP_NOT_FOUND);
        }

        if (!$fundraiser->isEditable()) {
            return $this->json([
                'message' => 'Cette cagnotte ne peut plus etre soumise.',
            ], Response::HTTP_CONFLICT);
        }

        $fundraiser
            ->setStatus(FundraiserStatus::PendingReview)
            ->setAdminValidationStatus(AdminValidationStatus::Pending)
            ->setAdminValidationComment(null)
            ->setPublishedAt(null);

        $entityManager->flush();

        return $this->json([
            'message' => 'Cagnotte soumise a validation.',
            'item' => $fundraiserViewFactory->buildOwnerSummary($fundraiser),
        ]);
    }

    #[Route('/api/fundraisers/{id}/archive', name: 'api_owner_fundraiser_archive', methods: ['PATCH'])]
    public function archive(
        string $id,
        FundraiserRepository $fundraiserRepository,
        EntityManagerInterface $entityManager,
        FundraiserViewFactory $fundraiserViewFactory,
    ): JsonResponse
    {
        $owner = $this->getAuthenticatedUser();

        if (!$owner instanceof User) {
            return $this->json([
                'message' => 'Authentification requise.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        $fundraiser = $fundraiserRepository->findOneOwnedById($owner, $id);

        if (!$fundraiser instanceof Fundraiser) {
            return $this->json([
                'message' => 'Cagnotte introuvable.',
            ], Response::HTTP_NOT_FOUND);
        }

        $fundraiser->setStatus(FundraiserStatus::Archived);
        $entityManager->flush();

        return $this->json([
            'message' => 'Cagnotte archivee.',
            'item' => $fundraiserViewFactory->buildOwnerSummary($fundraiser),
        ]);
    }

    #[Route('/api/uploads/fundraiser-cover', name: 'api_owner_fundraiser_cover_upload', methods: ['POST'])]
    public function uploadCoverImage(Request $request): JsonResponse
    {
        $owner = $this->getAuthenticatedUser();

        if (!$owner instanceof User) {
            return $this->json([
                'message' => 'Authentification requise.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        $file = $request->files->get('file');

        if (!$file instanceof UploadedFile) {
            return $this->json([
                'message' => 'Aucun fichier image n a ete envoye.',
                'errors' => [
                    'file' => 'Une image est obligatoire.',
                ],
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (!in_array($file->getMimeType(), self::ALLOWED_COVER_IMAGE_MIME_TYPES, true)) {
            return $this->json([
                'message' => 'Format de fichier invalide.',
                'errors' => [
                    'file' => 'Formats acceptes : JPG, PNG ou WEBP.',
                ],
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if ($file->getSize() !== null && $file->getSize() > self::MAX_COVER_IMAGE_SIZE) {
            return $this->json([
                'message' => 'Fichier trop volumineux.',
                'errors' => [
                    'file' => 'L image doit faire 5 Mo maximum.',
                ],
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $uploadDirectory = $this->getParameter('kernel.project_dir').'/public/uploads/fundraisers';

        if (!is_dir($uploadDirectory) && !@mkdir($uploadDirectory, 0777, true) && !is_dir($uploadDirectory)) {
            return $this->json([
                'message' => 'Le dossier de destination n est pas accessible en ecriture.',
                'errors' => [
                    'file' => 'Le serveur ne peut pas enregistrer l image pour le moment.',
                ],
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        $extension = $file->guessExtension();

        if (!is_string($extension) || $extension === '') {
            $extension = match ($file->getMimeType()) {
                'image/jpeg' => 'jpg',
                'image/png' => 'png',
                default => 'webp',
            };
        }

        $filename = sprintf('fundraiser-%s.%s', bin2hex(random_bytes(16)), $extension);

        try {
            $file->move($uploadDirectory, $filename);
        } catch (FileException) {
            return $this->json([
                'message' => 'L image n a pas pu etre telechargee.',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return $this->json([
            'message' => 'Image telechargee.',
            'url' => '/uploads/fundraisers/'.$filename,
        ], Response::HTTP_CREATED);
    }

    #[Route('/api/me/fundraisers', name: 'api_me_fundraiser_list', methods: ['GET'])]
    public function mine(
        FundraiserRepository $fundraiserRepository,
        FundraiserViewFactory $fundraiserViewFactory,
    ): JsonResponse
    {
        $owner = $this->getAuthenticatedUser();

        if (!$owner instanceof User) {
            return $this->json([
                'message' => 'Authentification requise.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        $items = array_map(
            $fundraiserViewFactory->buildOwnerSummary(...),
            $fundraiserRepository->findMine($owner),
        );

        return $this->json([
            'items' => $items,
        ]);
    }

    #[Route('/api/me/fundraisers/{id}', name: 'api_me_fundraiser_detail', methods: ['GET'])]
    public function myDetail(
        string $id,
        FundraiserRepository $fundraiserRepository,
        FundraiserViewFactory $fundraiserViewFactory,
    ): JsonResponse
    {
        $owner = $this->getAuthenticatedUser();

        if (!$owner instanceof User) {
            return $this->json([
                'message' => 'Authentification requise.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        $fundraiser = $fundraiserRepository->findOneOwnedById($owner, $id);

        if (!$fundraiser instanceof Fundraiser) {
            return $this->json([
                'message' => 'Cagnotte introuvable.',
            ], Response::HTTP_NOT_FOUND);
        }

        return $this->json([
            'item' => $fundraiserViewFactory->buildOwnerSummary($fundraiser),
        ]);
    }

    #[Route('/api/me/fundraisers/{id}/contributions', name: 'api_me_fundraiser_contributions', methods: ['GET'])]
    public function myContributions(
        string $id,
        FundraiserRepository $fundraiserRepository,
        ContributionRepository $contributionRepository,
        ContributionViewFactory $contributionViewFactory,
    ): JsonResponse
    {
        $owner = $this->getAuthenticatedUser();

        if (!$owner instanceof User) {
            return $this->json([
                'message' => 'Authentification requise.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        $fundraiser = $fundraiserRepository->findOneOwnedById($owner, $id);

        if (!$fundraiser instanceof Fundraiser) {
            return $this->json([
                'message' => 'Cagnotte introuvable.',
            ], Response::HTTP_NOT_FOUND);
        }

        return $this->json([
            'items' => array_map(
                $contributionViewFactory->buildOwnerItem(...),
                $contributionRepository->findAllByFundraiser($fundraiser),
            ),
        ]);
    }

    private function getAuthenticatedUser(): ?User
    {
        $user = $this->getUser();

        return $user instanceof User ? $user : null;
    }

    /**
     * @return array<string, mixed>
     */
    private function decodeJsonPayload(Request $request): array
    {
        $content = trim($request->getContent());

        if ($content === '') {
            return [];
        }

        $payload = json_decode($content, true, 512, JSON_THROW_ON_ERROR);

        return is_array($payload) ? $payload : [];
    }

    /**
     * @param array<string, mixed> $payload
     *
     * @return array{errors: array<string, string>, title: string, description: string, category: ?string, coverImage: ?string, targetAmount: string, endDate: \DateTimeImmutable}
     */
    private function validateFundraiserPayload(array $payload): array
    {
        $errors = [];
        $title = trim((string) ($payload['title'] ?? ''));
        $description = trim((string) ($payload['description'] ?? ''));
        $category = trim((string) ($payload['category'] ?? ''));
        $coverImage = trim((string) ($payload['coverImage'] ?? ''));
        $targetAmountRaw = str_replace(',', '.', trim((string) ($payload['targetAmount'] ?? '')));
        $endDateRaw = trim((string) ($payload['endDate'] ?? ''));

        if ($title === '') {
            $errors['title'] = 'Le nom de la cagnotte est obligatoire.';
        }

        if ($description === '' || mb_strlen($description) < 20) {
            $errors['description'] = 'La description doit contenir au moins 20 caracteres.';
        }

        if ($category !== '' && !in_array($category, self::ALLOWED_CATEGORIES, true)) {
            $errors['category'] = 'La categorie selectionnee est invalide.';
        }

        if ($targetAmountRaw === '' || !is_numeric($targetAmountRaw) || (float) $targetAmountRaw <= 0) {
            $errors['targetAmount'] = 'Le montant cible doit etre un nombre positif.';
        }

        try {
            $endDate = new \DateTimeImmutable($endDateRaw);
            $endDate = $endDate->setTime(23, 59, 59);
        } catch (\Exception) {
            $errors['endDate'] = 'La date de fin est invalide.';
            $endDate = new \DateTimeImmutable('today');
        }

        if (!isset($errors['endDate']) && $endDate < new \DateTimeImmutable('today')) {
            $errors['endDate'] = 'La date de fin doit etre dans le futur.';
        }

        return [
            'errors' => $errors,
            'title' => $title,
            'description' => $description,
            'category' => $category !== '' ? $category : null,
            'coverImage' => $coverImage !== '' ? $coverImage : null,
            'targetAmount' => number_format((float) $targetAmountRaw, 2, '.', ''),
            'endDate' => $endDate,
        ];
    }
}
