const CategoryLocators = {
  stngsBtn: '[data-qa="btn-settings"]',
  surveyBtn: '[data-qa="btn-surveys"]',
  ctgryBtn: '[data-qa="btn-categories"]',
  addCategoryBtn: '[data-qa="btn-settings-create"]',
  ctgryNameField: '[data-qa="name"]',
  ctgryDescField: '[data-qa="description"]',
  saveCtgryBtn: '[data-qa="btn-category-save"]',
  selectParentCtgry: '[data-qa="select-parent-category"]',
  everyoneRadio: '[data-qa="everyone"]',
  specificRolesRadioOption: '[data-qa="specific-roles..."]',
  translationCheckbox: '[data-qa="translation"]',
  technologyCheckbox: '[data-qa="technology"]',
  adminCheckbox: '[data-qa="admin"]',
  postSurveys: '[data-qa="add-post-modal-surveys"]',
  addSurveyBtn: '[data-qa="btn-settings-create"]',
  postTitleField: '[data-qa="null"]',
  postDescField: '[data-qa="description"]',
  savePostBtn: '[data-qa="btn-post-item-submit"]',
  addPostBtn: '[data-qa="submit-post-button"]',
};

export const getUniqueSelector = (name) => name.split(' ').join('-').toLowerCase();

export default CategoryLocators;
