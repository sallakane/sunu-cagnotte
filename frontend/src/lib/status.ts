const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  pending_review: "En attente de validation",
  published: "Publiée",
  rejected: "Refusée",
  completed: "Terminée",
  archived: "Archivée",
  pending: "En attente",
  approved: "Approuvée",
  initiated: "Initiée",
  paid: "Payée",
  failed: "Échouée",
  cancelled: "Annulée",
  refunded: "Remboursée",
};

export function formatStatusLabel(status?: string | null): string {
  if (!status) {
    return "Non défini";
  }

  return statusLabels[status] ?? status;
}
