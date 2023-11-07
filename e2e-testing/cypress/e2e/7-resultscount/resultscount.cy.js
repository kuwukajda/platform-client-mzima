import LoginFunctions from "../../functions/LoginFunctions";
import ResultsCountFunctions from "../../functions/ResultsCountFunctions";

describe("Automated Tests for ResultsCount on Data View", () => {
  const loginFunctions = new LoginFunctions();
  const resultsCountFunctions = new ResultsCountFunctions();

  it("View results count on data view ", () => {
    resultsCountFunctions.visit_landing_page();
    loginFunctions.click_through_onboarding();
    resultsCountFunctions.click_data_view_btn();
    resultsCountFunctions.verify_results_count_on_data_view();

  });
});
