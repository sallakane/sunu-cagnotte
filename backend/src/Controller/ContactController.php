<?php

namespace App\Controller;

use App\Entity\ContactMessage;
use App\Enum\ContactMessageStatus;
use App\Service\Mailer\TransactionalMailer;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class ContactController extends AbstractController
{
    #[Route('/api/contact', name: 'api_contact_create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $entityManager,
        TransactionalMailer $transactionalMailer,
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
        $name = trim((string) ($payload['name'] ?? ''));
        $email = mb_strtolower(trim((string) ($payload['email'] ?? '')));
        $phone = trim((string) ($payload['phone'] ?? ''));
        $subject = trim((string) ($payload['subject'] ?? ''));
        $message = trim((string) ($payload['message'] ?? ''));

        if ($name === '') {
            $errors['name'] = 'Le nom est obligatoire.';
        }

        if ($email === '' || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
            $errors['email'] = 'Une adresse email valide est obligatoire.';
        }

        if ($subject === '') {
            $errors['subject'] = 'Le sujet est obligatoire.';
        }

        if ($message === '' || mb_strlen($message) < 10) {
            $errors['message'] = 'Le message doit contenir au moins 10 caracteres.';
        }

        if ($errors !== []) {
            return $this->json([
                'message' => 'Validation impossible.',
                'errors' => $errors,
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $contactMessage = (new ContactMessage())
            ->setName($name)
            ->setEmail($email)
            ->setPhone($phone !== '' ? $phone : null)
            ->setSubject($subject)
            ->setMessage($message)
            ->setStatus(ContactMessageStatus::New);

        $entityManager->persist($contactMessage);
        $entityManager->flush();
        $transactionalMailer->sendContactNotification($contactMessage);

        return $this->json([
            'message' => 'Message envoye avec succes.',
            'item' => [
                'id' => $contactMessage->getId()->toRfc4122(),
                'status' => $contactMessage->getStatus()->value,
                'createdAt' => $contactMessage->getCreatedAt()->format(\DateTimeInterface::ATOM),
            ],
        ], Response::HTTP_CREATED);
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
