import { Login } from '../actions';

describe('Initialize login page', () => {
  before(() => {
    cy.visit('/');
    localStorage.setItem('USH_is_onboarding_done', 'true');
    cy.get('app-cookies-notification').should('exist');
    cy.get(`[data-qa="button-decline-cookies"]`).contains('Decline').click();
  });

  it('Input login information', () => {
    Login.loginForm();
  });
});
