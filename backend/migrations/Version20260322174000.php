<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260322174000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add optional category column to fundraiser.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE fundraiser ADD category VARCHAR(120) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE fundraiser DROP category');
    }
}
