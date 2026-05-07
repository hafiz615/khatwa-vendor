import { designerEndpoints } from "./api";
import apiConnector from "./apiConnector";

/**
 * @returns {Promise<{ success: boolean, payouts?: Array<Record<string, unknown>>, message?: string }>}
 */
export async function fetchDesignerPayouts() {
  const { data } = await apiConnector("GET", designerEndpoints.PAYOUTS_API);
  return data;
}

/**
 * @returns {Promise<{ success: boolean, transactions?: Array<Record<string, unknown>>, message?: string }>}
 */
export async function fetchDesignerPayoutTransactions() {
  const { data } = await apiConnector(
    "GET",
    designerEndpoints.PAYOUT_TRANSACTIONS_API
  );
  return data;
}
