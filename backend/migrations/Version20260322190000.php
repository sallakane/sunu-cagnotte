<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260322190000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add ending soon alert timestamp on fundraiser.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE fundraiser ADD ending_soon_alert_sent_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE fundraiser DROP ending_soon_alert_sent_at');
    }
}
