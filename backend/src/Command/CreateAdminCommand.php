<?php

namespace App\Command;

use App\Entity\User;
use App\Enum\UserRole;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(
    name: 'app:create-admin',
    description: 'Create or promote an admin user for local development.',
)]
class CreateAdminCommand extends Command
{
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly UserPasswordHasherInterface $passwordHasher,
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addArgument('email', InputArgument::REQUIRED, 'Admin email')
            ->addArgument('password', InputArgument::REQUIRED, 'Admin password')
            ->addArgument('first-name', InputArgument::OPTIONAL, 'First name', 'Admin')
            ->addArgument('last-name', InputArgument::OPTIONAL, 'Last name', 'Local')
            ->addArgument('phone', InputArgument::OPTIONAL, 'Phone', '+221700000000');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $email = mb_strtolower((string) $input->getArgument('email'));
        $password = (string) $input->getArgument('password');

        $user = $this->userRepository->findOneByEmail($email);

        if (!$user instanceof User) {
            $user = (new User())
                ->setEmail($email)
                ->setFirstName((string) $input->getArgument('first-name'))
                ->setLastName((string) $input->getArgument('last-name'))
                ->setPhone((string) $input->getArgument('phone'));

            $this->entityManager->persist($user);
        }

        $user->setRoles([UserRole::Admin->value, UserRole::User->value]);
        $user->setPassword($this->passwordHasher->hashPassword($user, $password));

        $this->entityManager->flush();

        $io->success(sprintf('Admin ready: %s', $email));

        return Command::SUCCESS;
    }
}

