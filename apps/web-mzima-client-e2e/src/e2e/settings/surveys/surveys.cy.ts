import { Base, Login, Settings, Surveys } from '../../actions';

describe('Initialize surveys page', () => {
  before(() => {
    Base.goHomePage();
    Base.saveLocalStorage('USH_is_onboarding_done', 'true');
    cy.get('app-cookies-notification').should('exist');
    cy.get(`[data-qa="button-decline-cookies"]`).contains('Decline').click();
    Login.loginForm();
    Settings.checkSettingsPage();
  });

  it('Surveys page exists', () => {
    Surveys.checkSurveyPage();
  });
});
