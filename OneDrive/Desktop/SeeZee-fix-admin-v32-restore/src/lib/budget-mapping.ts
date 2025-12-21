import { BudgetTier } from '@prisma/client';

/**
 * Maps form budget values (lowercase strings) to BudgetTier enum values
 * Handles various formats that might come from forms
 */
export function mapBudgetToTier(budget: string | null | undefined): BudgetTier {
  if (!budget) {
    return BudgetTier.UNKNOWN;
  }

  const normalized = budget.toLowerCase().trim();

  const budgetMap: Record<string, BudgetTier> = {
    // Lowercase form values
    'micro': BudgetTier.MICRO,
    'small': BudgetTier.SMALL,
    'medium': BudgetTier.MEDIUM,
    'large': BudgetTier.LARGE,
    'enterprise': BudgetTier.ENTERPRISE,
    'unknown': BudgetTier.UNKNOWN,
    
    // Already uppercase enum values (for backwards compatibility)
    'MICRO': BudgetTier.MICRO,
    'SMALL': BudgetTier.SMALL,
    'MEDIUM': BudgetTier.MEDIUM,
    'LARGE': BudgetTier.LARGE,
    'ENTERPRISE': BudgetTier.ENTERPRISE,
    'UNKNOWN': BudgetTier.UNKNOWN,
  };

  const mapped = budgetMap[normalized];
  
  if (!mapped) {
    console.warn(`Unknown budget value: "${budget}", defaulting to UNKNOWN`);
    return BudgetTier.UNKNOWN;
  }

  return mapped;
}






