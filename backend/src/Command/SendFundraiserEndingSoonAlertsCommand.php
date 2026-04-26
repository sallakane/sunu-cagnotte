<?php

namespace App\Command;

use App\Repository\FundraiserRepository;
use App\Service\Mailer\TransactionalMailer;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:fundraisers:send-ending-soon-alerts',
    description: 'Send reminder emails for published fundraisers that are ending soon.',
)]
class SendFundraiserEndingSoonAlertsCommand extends Command
{
    public function __construct(
        private readonly FundraiserRepository $fundraiserRepository,
        private readonly TransactionalMailer $transactionalMailer,
        private readonly EntityManagerInterface $entityManager,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $fundraisers = $this->fundraiserRepository->findPublishedEndingSoonNeedingAlert(2);

        foreach ($fundraisers as $fundraiser) {
            $this->transactionalMailer->sendFundraiserEndingSoon($fundraiser);
            $fundraiser->setEndingSoonAlertSentAt(new \DateTimeImmutable());
        }

        $this->entityManager->flush();

        $io->success(sprintf('%d alertes de fin proche envoyees.', count($fundraisers)));

        return Command::SUCCESS;
    }
}
