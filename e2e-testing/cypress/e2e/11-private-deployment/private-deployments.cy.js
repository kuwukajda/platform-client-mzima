import LoginFunctions from "../../functions/LoginFunctions";
import PrivateDeploymentFunctions from "../../functions/PrivateDeploymentFunctions";

describe("Automated Tests for Private deployment", () => {
  const loginFunctions = new LoginFunctions();
  const privateDeploymentFunctions = new PrivateDeploymentFunctions();

  beforeEach(() => {
    loginFunctions.login_as_admin();
    cy.visit(Cypress.env('baseUrl'));
  });

  it("Steps to make a Private deployment", () => {
    privateDeploymentFunctions.make_deployment_private()
    loginFunctions.logout();
    privateDeploymentFunctions.check_access_denied();
    privateDeploymentFunctions.check_contact_email();
    privateDeploymentFunctions.check_url_is_forbidden();
  });
});