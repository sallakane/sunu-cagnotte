const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  pending_review: "En attente de validation",
  published: "Publiee",
  rejected: "Refusee",
  completed: "Terminee",
  archived: "Archivee",
  pending: "En attente",
  approved: "Approuvee",
  initiated: "Initiee",
  paid: "Payee",
  failed: "Echouee",
  cancelled: "Annulee",
  refunded: "Remboursee",
};

export function formatStatusLabel(status?: string | null): string {
  if (!status) {
    return "Non defini";
  }

  return statusLabels[status] ?? status;
}
