import SignupLocators from '../locators/SignupLocators';
import LoginFunctions from './LoginFunctions';

const loginFunctions = new LoginFunctions();

function backspace(number) {
  let str = '';
  for (let i = 0; i < number; i++) {
    str += '{backspace}';
  }
  return str;
}
class SignupFunctions {
  constructor() {
    this.uniqueName = `Cypress User${Math.floor(Math.random() * 900) + 100}`;
    this.uniqueEmail = `cypress.${Math.floor(Math.random() * 900) + 100}@xyz.com`;
  }
  navigate_to_signup_modal() {
    loginFunctions.launch_login_modal(Cypress.env('baseUrl'));
    cy.get('#mat-tab-label-1-1')
      .click()
    cy.get(SignupLocators.signupTab).eq(1).click({force: true});
  }

  type_name(name) {
    cy.wait(1000);
    cy.get(SignupLocators.nameField)
      .type(name, {force: true})
      .should('have.value', name);
  }

  fill_all_fields() {
    this.type_name(this.uniqueName);
    loginFunctions.type_email(this.uniqueEmail);
    loginFunctions.type_password('Password@Cypress2023');
    cy.get(SignupLocators.agreeToTerms).click({ force: true });
  }

  verify_signup_is_enabled() {
    cy.get(SignupLocators.signupBtn).should('be.enabled');
  }

  verify_signup_is_disabled() {
    cy.get(SignupLocators.signupBtn).should('be.disabled');
  }

  empty_name_field() {
    cy.get(SignupLocators.nameField).clear({force: true});
  }

  alter_email_field() {
    // delete xyz.com
    cy.get(SignupLocators.emailField).type(backspace(7), {force: true});
    cy.get(SignupLocators.emailField).blur({ force: true });
  }

  verify_email_is_invalid() {
    cy.get(SignupLocators.invalidEmailError)
      .invoke('css', 'overflow-x', 'visible')
      .should('have.css', 'overflow-x', 'visible');
  }

  restore_correct_email_value() {
    cy.get(SignupLocators.emailField).type('xyz.com',{ force: true });
  }

  verify_privacy_and_terms_link() {
    cy.get(SignupLocators.termsLink)
      .eq(0)
      .should('have.attr', 'href', 'https://www.ushahidi.com/privacy-policy');
    cy.get(SignupLocators.termsLink)
      .eq(1)
      .should('have.attr', 'href', 'https://www.ushahidi.com/terms-of-service');
  }

  click_signup_button() {
    cy.get(SignupLocators.signupBtn).click({ force: true });
  }

  open_account_modal() {
    cy.get(SignupLocators.accountInfoBtn).click();
    cy.get(SignupLocators.accountStnsBtn).click();
  }

  close_account_modal() {
    cy.get(SignupLocators.closeDialogBtn).click();
  }

  verify_name_and_email_matches() {
    console.log(this.uniqueEmail, this.uniqueName)
    cy.get(SignupLocators.displayName).contains(this.uniqueName);
    cy.get(SignupLocators.displayEmail).contains(this.uniqueEmail);
  }

  verify_signed_user() {
    this.open_account_modal();
    this.verify_name_and_email_matches();
    this.close_account_modal();
  }

  login_created_user(){
    loginFunctions.logout();
    cy.get(SignupLocators.loginModal).click()
    // loginFunctions.launch_login_modal(Cypress.env('baseUrl'));
    loginFunctions.type_email(this.uniqueEmail);
    loginFunctions.type_password('Password@Cypress2023')
    loginFunctions.click_login_button();
  }

  signup() {
    this.navigate_to_signup_modal();
    this.fill_all_fields();
    this.verify_signup_is_enabled();
    this.empty_name_field();
    this.verify_signup_is_disabled();
    this.alter_email_field();
    this.verify_email_is_invalid();
    this.verify_signup_is_disabled();
    this.type_name(this.uniqueName);
    this.restore_correct_email_value();
    this.verify_signup_is_enabled();
    this.verify_privacy_and_terms_link();
    this.click_signup_button();
    this.verify_signed_user();
    this.login_created_user();
  }
}

export default SignupFunctions;
