import UserLocators from '../locators/UserLocators';

class UserFunctions {
  open_user_page_steps() {
    cy.wait(2000);
    cy.get(UserLocators.stngsBtn).click();
    cy.get(UserLocators.usersBtn).click();
  }

  add_user_steps(userName, userEmail, pwd) {
    cy.get(UserLocators.addUserBtn).click();
    cy.get(UserLocators.nameField).type(userName);
    cy.get(UserLocators.emailField).type(userEmail);
    cy.get(UserLocators.pwdField).type(pwd);
    cy.get(UserLocators.userRoleSlct).click();
    cy.get(UserLocators.roleAdmin).click();
    cy.get(UserLocators.saveBtn).click();
    cy.wait(1000); //without this wait, the test fails. next step is triggered quick before the save function completes
  }

  delete_user_steps() {
    //type search term in bits for search to actually happen
    //typing all at once, search doesn't happen
    cy.get(UserLocators.searchUserField).type('Aut');
    cy.get(UserLocators.searchUserField).type('o');

    cy.get(UserLocators.bulkActionsBtn).click();
    cy.wait(1000);
    cy.get(UserLocators.checkUser).click();
    cy.get(UserLocators.deleteUsersBtn).click();
    cy.get(UserLocators.deleteUserConfirmBtn).click();
  }

  add_user() {
    this.open_user_page_steps();
    this.add_user_steps('Auto User', 'automateduser@ushahidi.com', Cypress.env('ush_user_pwd'));
  }
  delete_user() {
    this.open_user_page_steps();
    this.delete_user_steps();
  }
}

export default UserFunctions;
