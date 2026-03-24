<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/me')]
class MeController extends AbstractController
{
    #[Route('', name: 'api_me_profile', methods: ['GET'])]
    public function profile(): JsonResponse
    {
        $user = $this->getAuthenticatedUser();

        if (!$user instanceof User) {
            return $this->json([
                'message' => 'Authentification requise.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        return $this->json([
            'item' => $this->buildUserView($user),
        ]);
    }

    #[Route('', name: 'api_me_profile_update', methods: ['PUT'])]
    public function update(
        Request $request,
        EntityManagerInterface $entityManager,
    ): JsonResponse
    {
        $user = $this->getAuthenticatedUser();

        if (!$user instanceof User) {
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

        $errors = [];
        $firstName = trim((string) ($payload['firstName'] ?? ''));
        $lastName = trim((string) ($payload['lastName'] ?? ''));
        $phone = trim((string) ($payload['phone'] ?? ''));

        if ($firstName === '') {
            $errors['firstName'] = 'Le prenom est obligatoire.';
        }

        if ($lastName === '') {
            $errors['lastName'] = 'Le nom est obligatoire.';
        }

        if ($phone === '') {
            $errors['phone'] = 'Le telephone est obligatoire.';
        }

        if ($errors !== []) {
            return $this->json([
                'message' => 'Validation impossible.',
                'errors' => $errors,
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $user
            ->setFirstName($firstName)
            ->setLastName($lastName)
            ->setPhone($phone);

        $entityManager->flush();

        return $this->json([
            'message' => 'Profil mis a jour.',
            'item' => $this->buildUserView($user),
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
     * @return array<string, mixed>
     */
    private function buildUserView(User $user): array
    {
        return [
            'id' => $user->getId()->toRfc4122(),
            'firstName' => $user->getFirstName(),
            'lastName' => $user->getLastName(),
            'email' => $user->getEmail(),
            'phone' => $user->getPhone(),
            'roles' => $user->getRoles(),
            'createdAt' => $user->getCreatedAt()->format(\DateTimeInterface::ATOM),
            'updatedAt' => $user->getUpdatedAt()->format(\DateTimeInterface::ATOM),
        ];
    }
}
