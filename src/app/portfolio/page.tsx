import { redirect } from "next/navigation";

/**
 * Redirect /portfolio to /deals/portfolio
 * The main portfolio page is at /deals/portfolio which fetches from the database
 */
export default function PortfolioRedirect() {
  redirect("/deals/portfolio");
}
