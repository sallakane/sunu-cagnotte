export type RecentContribution = {
  id: string;
  displayName: string;
  amount: number;
  message: string | null;
  paidAt?: string | null;
};

export type FundraiserSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  description: string;
  coverImage: string | null;
  targetAmount: number;
  collectedAmount: number;
  remainingAmount: number;
  currency: string;
  endDate: string;
  progressPercentage: number;
  contributorCount: number;
  daysRemaining: number;
  category: string | null;
  createdAt: string;
  publishedAt?: string | null;
  status?: string;
  adminValidationStatus?: string;
  adminValidationComment?: string | null;
  updatedAt?: string;
  isEditable?: boolean;
};

export type FundraiserDetail = FundraiserSummary & {
  recentContributions: RecentContribution[];
};

export type PaymentContributionStatus = {
  id: string;
  paymentReference: string;
  status: string;
  amountGross: number;
  amountNet: number | null;
  providerFeeAmount: number | null;
  paymentProvider: string;
  providerTransactionId: string | null;
  paidAt: string | null;
  fundraiser: {
    id: string;
    slug: string;
    title: string;
  };
};

export type MeProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
};
