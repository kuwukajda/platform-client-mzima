import CollectionLocators from '../locators/CollectionLocators';

class CollectionFunctions {
  click_collections_button() {
    cy.get(CollectionLocators.collectionBtn).click();
    cy.get(CollectionLocators.addcollectionBtn).click();
  }

  type_name(name) {
    cy.get(CollectionLocators.collectionNameField).type(name).should('have.value', name);
  }

  type_description(description) {
    cy.get(CollectionLocators.collectionDescField).clear().type(description);
  }

  visibility() {
    cy.get(CollectionLocators.onlyMeRadio).click({ force: true });
  }

  save_collection() {
    cy.get(CollectionLocators.saveCollectionBtn).click();
  }

  open_collections() {
    cy.get(CollectionLocators.collectionBtn).click();
  }

  select_collections() {
    cy.get(CollectionLocators.selectCollection)
      .contains('Automation Collection - Everyone')
      .click();
  }

  type_post_title(title) {
    cy.get(CollectionLocators.postTitleField).type(title).should('have.value', title);
  }

  type_post_description(description) {
    cy.get(CollectionLocators.postDescField).type(description);
  }

  save_post() {
    cy.get(CollectionLocators.savePostBtn).click();
  }
  post_to_collection() {
    //navigate to data view
    cy.get(CollectionLocators.dataBtn).click();
    //open post and click on three dots of first post
    cy.get(CollectionLocators.post).contains('One').click();
    cy.get(CollectionLocators.postMenuDots).eq(1).click();
    cy.get(CollectionLocators.addToCollectionBtn).click();
    this.select_collections();
    //dismiss collection modal
    cy.get(CollectionLocators.closeModalBtn).click();
  }

  verify_post_added_to_collection() {
    this.open_collections();
    this.select_collections();
    cy.contains('One').should('exist');
  }

  create_collection() {
    let collectionName = `Automated Collection-${Math.floor(Math.random() * 100000000000)}`;
    this.click_collections_button();
    this.type_name(collectionName);
    this.type_description('Automated Description');
    this.visibility();
    this.save_collection();
  }

  add_post_to_collection() {
    this.post_to_collection();
    this.verify_post_added_to_collection();
  }
}

export default CollectionFunctions;
