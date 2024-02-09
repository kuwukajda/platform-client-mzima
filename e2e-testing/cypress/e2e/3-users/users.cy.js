import LoginFunctions from "../../functions/LoginFunctions";
import UserFunctions from "../../functions/UserFunctions";

describe("Automated Tests for Users", () => {
  const loginFunctions = new LoginFunctions();
  const userFunctions = new UserFunctions();

  beforeEach(() => {
    loginFunctions.login_as_admin();
    cy.visit(Cypress.env('baseUrl'));
  });
  it("Adds User", () => {
    userFunctions.add_user();
  });
  it("Deletes User",()=>{
    userFunctions.delete_user();
  })
});
