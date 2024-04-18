import LoginFunctions from "../../functions/LoginFunctions";
import SurveyConfigurationFunctions from "../../functions/SurveyConfigurationFunctions";

describe("Automated Tests for Survey Configurations", () => {
  const loginFunctions = new LoginFunctions();
  const surveyConfigurationFunctions = new SurveyConfigurationFunctions();

  beforeEach(() => {
    loginFunctions.login_as_admin();
    cy.visit(Cypress.env('baseUrl'));
  });

  it.skip("Verify posts go into Published state as configured", () => {
    surveyConfigurationFunctions.require_posts_reviewed_before_published()
  });

  it("Verifies author information stays hidden", () => {
    surveyConfigurationFunctions.hide_author_information_and_verify()
  });
});