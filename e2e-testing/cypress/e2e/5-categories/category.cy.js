import LoginFunctions from '../../functions/LoginFunctions';
import CategoryFunctions from '../../functions/CategoryFunctions';

describe('Automated Tests for Categories', () => {
  const loginFunctions = new LoginFunctions();
  const categoryFunctions = new CategoryFunctions();

  beforeEach(() => {
    loginFunctions.login_as_admin();
    cy.visit(Cypress.env('baseUrl'));
  });

  it('Opens Categories Page', () => {
    categoryFunctions.open_category_creation_page_steps();
    categoryFunctions.add_category_details_steps();
    categoryFunctions.complete_add_category_steps();
    categoryFunctions.verify_created_category_exists();
  });

  it('Add Post to Categories', () => {
    categoryFunctions.add_post_to_category();
  });
});
