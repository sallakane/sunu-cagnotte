<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260324140000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add password reset token fields on user.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE "user" ADD password_reset_token_hash VARCHAR(64) DEFAULT NULL');
        $this->addSql('ALTER TABLE "user" ADD password_reset_requested_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
        $this->addSql('ALTER TABLE "user" ADD password_reset_expires_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
        $this->addSql('CREATE INDEX idx_user_password_reset_token_hash ON "user" (password_reset_token_hash)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX idx_user_password_reset_token_hash');
        $this->addSql('ALTER TABLE "user" DROP password_reset_token_hash');
        $this->addSql('ALTER TABLE "user" DROP password_reset_requested_at');
        $this->addSql('ALTER TABLE "user" DROP password_reset_expires_at');
    }
}
