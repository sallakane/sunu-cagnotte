<?php

namespace App\Service\Mailer;

use App\Entity\ContactMessage;
use App\Entity\Contribution;
use App\Entity\Fundraiser;
use App\Entity\User;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Mailer\MailerInterface;

final class TransactionalMailer
{
    public function __construct(
        private readonly MailerInterface $mailer,
        private readonly string $contactRecipient,
        private readonly string $frontendBaseUrl,
    ) {
    }

    public function sendFundraiserCreated(User $user, Fundraiser $fundraiser): void
    {
        $email = (new TemplatedEmail())
            ->to($user->getEmail())
            ->subject(sprintf('Cagnotte creee: %s', $fundraiser->getTitle()))
            ->htmlTemplate('emails/fundraiser_created.html.twig')
            ->context($this->withBranding([
                'user' => $user,
                'fundraiser' => $fundraiser,
                'dashboardUrl' => rtrim($this->frontendBaseUrl, '/').'/espace/cagnottes',
            ]));

        $this->mailer->send($email);
    }

    public function sendContributionPaid(Contribution $contribution): void
    {
        if (trim($contribution->getEmail()) === '') {
            return;
        }

        $email = (new TemplatedEmail())
            ->to($contribution->getEmail())
            ->subject(sprintf('Contribution confirmee pour %s', $contribution->getFundraiser()->getTitle()))
            ->htmlTemplate('emails/contribution_paid.html.twig')
            ->context($this->withBranding([
                'contribution' => $contribution,
                'fundraiser' => $contribution->getFundraiser(),
                'fundraiserUrl' => rtrim($this->frontendBaseUrl, '/').'/cagnottes/'.$contribution->getFundraiser()->getSlug(),
            ]));

        $this->mailer->send($email);
    }

    public function sendFundraiserCreatedAdminNotification(Fundraiser $fundraiser): void
    {
        $email = (new TemplatedEmail())
            ->to($this->contactRecipient)
            ->subject(sprintf('[Nouvelle cagnotte] %s — à valider', $fundraiser->getTitle()))
            ->htmlTemplate('emails/fundraiser_created_admin.html.twig')
            ->context($this->withBranding([
                'fundraiser' => $fundraiser,
                'owner' => $fundraiser->getOwner(),
                'adminUrl' => rtrim($this->frontendBaseUrl, '/').'/admin',
            ]));

        $this->mailer->send($email);
    }

    public function sendContactNotification(ContactMessage $contactMessage): void
    {
        $email = (new TemplatedEmail())
            ->to($this->contactRecipient)
            ->subject(sprintf('Nouveau message de contact: %s', $contactMessage->getSubject()))
            ->htmlTemplate('emails/contact_notification.html.twig')
            ->context($this->withBranding([
                'contactMessage' => $contactMessage,
            ]));

        $this->mailer->send($email);
    }

    public function sendFundraiserEndingSoon(Fundraiser $fundraiser): void
    {
        $email = (new TemplatedEmail())
            ->to($fundraiser->getOwner()->getEmail())
            ->subject(sprintf('Votre cagnotte se termine bientot: %s', $fundraiser->getTitle()))
            ->htmlTemplate('emails/fundraiser_ending_soon.html.twig')
            ->context($this->withBranding([
                'fundraiser' => $fundraiser,
                'owner' => $fundraiser->getOwner(),
                'dashboardUrl' => rtrim($this->frontendBaseUrl, '/').'/espace/cagnottes',
            ]));

        $this->mailer->send($email);
    }

    public function sendPasswordReset(User $user, string $resetUrl): void
    {
        $email = (new TemplatedEmail())
            ->to($user->getEmail())
            ->subject('Reinitialisation de votre mot de passe')
            ->htmlTemplate('emails/password_reset.html.twig')
            ->context($this->withBranding([
                'user' => $user,
                'resetUrl' => $resetUrl,
            ]));

        $this->mailer->send($email);
    }

    /**
     * @param array<string, mixed> $context
     *
     * @return array<string, mixed>
     */
    private function withBranding(array $context): array
    {
        $frontendBaseUrl = rtrim($this->frontendBaseUrl, '/');

        return [
            ...$context,
            'brandName' => 'Sunu Cagnotte',
            'homepageUrl' => $frontendBaseUrl,
            'brandLogoUrl' => $frontendBaseUrl.'/branding/logo.png',
            'brandPrimaryColor' => '#0f766e',
            'brandAccentColor' => '#f59e0b',
            'brandSurfaceColor' => '#f8fafc',
            'brandTextColor' => '#0f172a',
        ];
    }
}
