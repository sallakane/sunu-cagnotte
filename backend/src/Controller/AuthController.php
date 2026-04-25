<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Service\Mailer\TransactionalMailer;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/auth')]
class AuthController extends AbstractController
{
    private const PASSWORD_RESET_TTL_SECONDS = 3600;

    #[Route('/login', name: 'api_auth_login', methods: ['POST'])]
    public function login(): never
    {
        throw new \LogicException('This code should never be reached because the firewall handles login.');
    }

    #[Route('/register', name: 'api_auth_register', methods: ['POST'])]
    public function register(
        Request $request,
        UserRepository $userRepository,
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher,
    ): JsonResponse
    {
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
        $email = mb_strtolower(trim((string) ($payload['email'] ?? '')));
        $phone = trim((string) ($payload['phone'] ?? ''));
        $password = (string) ($payload['password'] ?? '');

        if ($firstName === '') {
            $errors['firstName'] = 'Le prenom est obligatoire.';
        }

        if ($lastName === '') {
            $errors['lastName'] = 'Le nom est obligatoire.';
        }

        if ($email === '' || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
            $errors['email'] = 'Une adresse email valide est obligatoire.';
        } elseif ($userRepository->findOneByEmail($email) instanceof User) {
            $errors['email'] = 'Cette adresse email est deja utilisee.';
        }

        if (mb_strlen($password) < 8) {
            $errors['password'] = 'Le mot de passe doit contenir au moins 8 caracteres.';
        }

        if ($errors !== []) {
            return $this->json([
                'message' => 'Validation impossible.',
                'errors' => $errors,
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $user = (new User())
            ->setFirstName($firstName)
            ->setLastName($lastName)
            ->setEmail($email)
            ->setPhone($phone);

        $user->setPassword($passwordHasher->hashPassword($user, $password));

        $entityManager->persist($user);
        $entityManager->flush();

        return $this->json([
            'message' => 'Compte cree avec succes.',
            'user' => [
                'id' => $user->getId()->toRfc4122(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'email' => $user->getEmail(),
                'phone' => $user->getPhone(),
                'roles' => $user->getRoles(),
                'createdAt' => $user->getCreatedAt()->format(\DateTimeInterface::ATOM),
            ],
        ], Response::HTTP_CREATED);
    }

    #[Route('/forgot-password', name: 'api_auth_forgot_password', methods: ['POST'])]
    public function forgotPassword(
        Request $request,
        UserRepository $userRepository,
        EntityManagerInterface $entityManager,
        TransactionalMailer $transactionalMailer,
        LoggerInterface $logger,
    ): JsonResponse
    {
        try {
            $payload = $this->decodeJsonPayload($request);
        } catch (\JsonException) {
            return $this->json([
                'message' => 'Le payload JSON est invalide.',
            ], Response::HTTP_BAD_REQUEST);
        }

        $email = mb_strtolower(trim((string) ($payload['email'] ?? '')));

        if ($email === '' || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
            return $this->json([
                'message' => 'Validation impossible.',
                'errors' => [
                    'email' => 'Une adresse email valide est obligatoire.',
                ],
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $user = $userRepository->findOneByEmail($email);

        if ($user instanceof User) {
            $rawToken = rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
            $requestedAt = new \DateTimeImmutable();
            $expiresAt = $requestedAt->modify(sprintf('+%d seconds', self::PASSWORD_RESET_TTL_SECONDS));

            $user
                ->setPasswordResetTokenHash(hash('sha256', $rawToken))
                ->setPasswordResetRequestedAt($requestedAt)
                ->setPasswordResetExpiresAt($expiresAt);

            $entityManager->flush();

            try {
                $transactionalMailer->sendPasswordReset(
                    $user,
                    sprintf('%s/reinitialiser-mot-de-passe?token=%s', rtrim($this->getParameter('app.frontend_base_url'), '/'), urlencode($rawToken)),
                );
            } catch (\Throwable $exception) {
                $logger->error('Impossible d envoyer l email de reinitialisation du mot de passe.', [
                    'exception' => $exception,
                    'userId' => $user->getId()->toRfc4122(),
                    'userEmail' => $user->getEmail(),
                ]);
            }
        }

        return $this->json([
            'message' => 'Si cette adresse existe, un email de reinitialisation a ete envoye.',
        ]);
    }

    #[Route('/reset-password', name: 'api_auth_reset_password', methods: ['POST'])]
    public function resetPassword(
        Request $request,
        UserRepository $userRepository,
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher,
    ): JsonResponse
    {
        try {
            $payload = $this->decodeJsonPayload($request);
        } catch (\JsonException) {
            return $this->json([
                'message' => 'Le payload JSON est invalide.',
            ], Response::HTTP_BAD_REQUEST);
        }

        $token = trim((string) ($payload['token'] ?? ''));
        $password = (string) ($payload['password'] ?? '');
        $passwordConfirmation = (string) ($payload['passwordConfirmation'] ?? '');
        $errors = [];

        if ($token === '') {
            $errors['token'] = 'Le token de reinitialisation est obligatoire.';
        }

        if (mb_strlen($password) < 8) {
            $errors['password'] = 'Le mot de passe doit contenir au moins 8 caracteres.';
        }

        if ($passwordConfirmation === '') {
            $errors['passwordConfirmation'] = 'La confirmation du mot de passe est obligatoire.';
        } elseif ($password !== $passwordConfirmation) {
            $errors['passwordConfirmation'] = 'La confirmation du mot de passe ne correspond pas.';
        }

        if ($errors !== []) {
            return $this->json([
                'message' => 'Validation impossible.',
                'errors' => $errors,
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $user = $userRepository->findOneByPasswordResetTokenHash(hash('sha256', $token));

        if (
            !$user instanceof User ||
            !$user->getPasswordResetExpiresAt() instanceof \DateTimeImmutable ||
            $user->getPasswordResetExpiresAt() < new \DateTimeImmutable()
        ) {
            return $this->json([
                'message' => 'Le lien de reinitialisation est invalide ou a expire.',
                'errors' => [
                    'token' => 'Le lien de reinitialisation est invalide ou a expire.',
                ],
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $user
            ->setPassword($passwordHasher->hashPassword($user, $password))
            ->clearPasswordReset();

        $entityManager->flush();

        return $this->json([
            'message' => 'Votre mot de passe a ete reinitialise avec succes.',
        ]);
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
}
