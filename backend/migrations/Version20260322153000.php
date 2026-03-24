<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260322153000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Initial schema for users, fundraisers, contributions, contact messages and payment logs.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

        $this->addSql(<<<'SQL'
            CREATE TABLE "user" (
                id UUID NOT NULL DEFAULT gen_random_uuid(),
                first_name VARCHAR(120) NOT NULL,
                last_name VARCHAR(120) NOT NULL,
                email VARCHAR(180) NOT NULL,
                phone VARCHAR(40) NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                roles JSON NOT NULL,
                created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                PRIMARY KEY(id)
            )
        SQL);
        $this->addSql('CREATE UNIQUE INDEX uniq_user_email ON "user" (email)');

        $this->addSql(<<<'SQL'
            CREATE TABLE fundraiser (
                id UUID NOT NULL DEFAULT gen_random_uuid(),
                owner_id UUID NOT NULL,
                title VARCHAR(180) NOT NULL,
                slug VARCHAR(180) NOT NULL,
                description TEXT NOT NULL,
                cover_image VARCHAR(255) DEFAULT NULL,
                target_amount NUMERIC(12, 2) NOT NULL,
                collected_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
                currency VARCHAR(3) NOT NULL DEFAULT 'XOF',
                end_date TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                status VARCHAR(32) NOT NULL,
                admin_validation_status VARCHAR(32) NOT NULL,
                admin_validation_comment TEXT DEFAULT NULL,
                created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                published_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL,
                PRIMARY KEY(id)
            )
        SQL);
        $this->addSql('CREATE UNIQUE INDEX uniq_fundraiser_slug ON fundraiser (slug)');
        $this->addSql('CREATE INDEX idx_fundraiser_owner ON fundraiser (owner_id)');
        $this->addSql('CREATE INDEX idx_fundraiser_status ON fundraiser (status)');
        $this->addSql('ALTER TABLE fundraiser ADD CONSTRAINT fk_fundraiser_owner FOREIGN KEY (owner_id) REFERENCES "user" (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');

        $this->addSql(<<<'SQL'
            CREATE TABLE contribution (
                id UUID NOT NULL DEFAULT gen_random_uuid(),
                fundraiser_id UUID NOT NULL,
                first_name VARCHAR(120) NOT NULL,
                last_name VARCHAR(120) NOT NULL,
                email VARCHAR(180) NOT NULL,
                phone VARCHAR(40) NOT NULL,
                amount_gross NUMERIC(12, 2) NOT NULL,
                amount_net NUMERIC(12, 2) DEFAULT NULL,
                provider_fee_amount NUMERIC(12, 2) DEFAULT NULL,
                is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
                public_display_name VARCHAR(120) DEFAULT NULL,
                message TEXT DEFAULT NULL,
                payment_provider VARCHAR(50) NOT NULL,
                payment_reference VARCHAR(120) NOT NULL,
                provider_transaction_id VARCHAR(120) DEFAULT NULL,
                status VARCHAR(32) NOT NULL,
                paid_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL,
                created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                PRIMARY KEY(id)
            )
        SQL);
        $this->addSql('CREATE UNIQUE INDEX uniq_contribution_payment_reference ON contribution (payment_reference)');
        $this->addSql('CREATE INDEX idx_contribution_fundraiser ON contribution (fundraiser_id)');
        $this->addSql('CREATE INDEX idx_contribution_status ON contribution (status)');
        $this->addSql('CREATE INDEX idx_contribution_provider_tx ON contribution (provider_transaction_id)');
        $this->addSql('ALTER TABLE contribution ADD CONSTRAINT fk_contribution_fundraiser FOREIGN KEY (fundraiser_id) REFERENCES fundraiser (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');

        $this->addSql(<<<'SQL'
            CREATE TABLE contact_message (
                id UUID NOT NULL DEFAULT gen_random_uuid(),
                name VARCHAR(180) NOT NULL,
                email VARCHAR(180) NOT NULL,
                phone VARCHAR(40) DEFAULT NULL,
                subject VARCHAR(180) NOT NULL,
                message TEXT NOT NULL,
                status VARCHAR(32) NOT NULL,
                created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                PRIMARY KEY(id)
            )
        SQL);
        $this->addSql('CREATE INDEX idx_contact_message_status ON contact_message (status)');

        $this->addSql(<<<'SQL'
            CREATE TABLE payment_log (
                id UUID NOT NULL DEFAULT gen_random_uuid(),
                contribution_id UUID NOT NULL,
                provider VARCHAR(50) NOT NULL,
                event_type VARCHAR(100) NOT NULL,
                payload JSON NOT NULL,
                received_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                PRIMARY KEY(id)
            )
        SQL);
        $this->addSql('CREATE INDEX idx_payment_log_contribution ON payment_log (contribution_id)');
        $this->addSql('CREATE INDEX idx_payment_log_provider_event ON payment_log (provider, event_type)');
        $this->addSql('ALTER TABLE payment_log ADD CONSTRAINT fk_payment_log_contribution FOREIGN KEY (contribution_id) REFERENCES contribution (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE payment_log DROP CONSTRAINT fk_payment_log_contribution');
        $this->addSql('ALTER TABLE contribution DROP CONSTRAINT fk_contribution_fundraiser');
        $this->addSql('ALTER TABLE fundraiser DROP CONSTRAINT fk_fundraiser_owner');
        $this->addSql('DROP TABLE payment_log');
        $this->addSql('DROP TABLE contact_message');
        $this->addSql('DROP TABLE contribution');
        $this->addSql('DROP TABLE fundraiser');
        $this->addSql('DROP TABLE "user"');
    }
}

