import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import paginationView from './views/paginationView.js';

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

// if (module.hot) {
//   module.hot.accept();
// }

// recipe

const controlRecipe = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;

    recipeView.renderSpinner();

    // 0) update the search result selected as marked

    resultsView.update(model.getSearchResultsPage());

    // 1) loading the recipe data

    await model.loadRecipe(id);

    // 2) rendering the recipe data

    recipeView.render(model.state.recipe);
    //  4) update the bookmark
    bookmarksView.update(model.state.bookmarks);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

// search results
const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    // 1) get search query
    const query = searchView.getQuery();
    if (!query) return;
    // 2) load search query
    await model.loadSearchResults(query);
    // 3) render search query
    // console.log(model.state.searchs.results);
    resultsView.render(model.getSearchResultsPage(1));
    // 3) render the initial pagination buttons
    paginationView.render(model.state.searchs);
  } catch (err) {
    console.error(err);
    // resultsView.renderError();
  }
};

const controlServings = function (newServings) {
  // update the servings in state
  model.updateServings(newServings);
  // update the recipeView
  recipeView.update(model.state.recipe);
};

const controlPagination = function (goToPage) {
  console.log(goToPage);
  // 3) render search query
  resultsView.render(model.getSearchResultsPage(goToPage));
  // 3) render the initial pagination buttons
  paginationView.render(model.state.searchs);
};

const controlAddBookmark = function () {
  if (!model.state.recipe.bookmarked) model.addBookMark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // update the recipe
  recipeView.update(model.state.recipe);

  // render bookmarks
  bookmarksView.render(model.state.bookmarks);

  // update ID in url
  window.history.pushState(null, '', `#${model.state.recipe.id}`);
};

const controlBookmark = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlUploadRecipe = async function (newRecipe) {
  try {
    // render spinner
    addRecipeView.renderSpinner();

    // upload recipe data
    console.log(newRecipe);
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // Render the recipe
    recipeView.render(model.state.recipe);

    // success message
    addRecipeView.renderMessage();

    // close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    // console.error(err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmark);
  recipeView.addHandlerRender(controlRecipe);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerPagination(controlPagination);
  addRecipeView.addHandlerUpload(controlUploadRecipe);
};
init();
// ['hashchange', 'load'].forEach(ev =>
//   window.addEventListener(`${ev}`, controlRecipe)
// );
// window.addEventListener('hashchange', showRecipe);
// window.addEventListener('load', showRecipe);
