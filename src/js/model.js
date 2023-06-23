import { async } from 'regenerator-runtime';
import { API_URL, RES_PER_PAGE, KEY } from './config';
import { AJAX } from './helpers';
import bookmarksView from './views/bookmarksView';
export const state = {
  recipe: {},
  searchs: {
    query: '',
    page: 1,
    results: [],
    searchsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
};

const createRecipeObject = function (data) {
  let { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  };
};

export const loadRecipe = async function (id) {
  try {
    // loading the recipe from given id
    if (!id) return;
    // console.log(id);

    // fetch the data of the recipe for given id
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);
    state.recipe = createRecipeObject(data);

    if (state.bookmarks.some(bookmark => bookmark.id === id)) {
      state.recipe.bookmarked = true;
    } else state.recipe.bookmarked = false;
    // console.log(data, recipe);
  } catch (err) {
    console.error(`${err} ⚠️⚠️`);
  }
};

export const loadSearchResults = async function (query) {
  try {
    // add the query in the state
    state.searchs.query = query;

    // getting the results for the query
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);

    // redefing the data for more relavant details
    state.searchs.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });
    state.searchs.page = 1;
    // console.log(state.searchs.results);
  } catch (err) {
    console.error(`${err} ⚠️⚠️`);
    throw err;
  }
};

export const getSearchResultsPage = function (page = state.searchs.page) {
  // sets the page number
  state.searchs.page = page;

  // count of results on a page
  const start = (page - 1) * state.searchs.searchsPerPage;
  const end = page * state.searchs.searchsPerPage;
  console.log(state.searchs.results.slice(start, end));
  return state.searchs.results.slice(start, end);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });
  state.recipe.servings = newServings;
};
// loadSearchResults('pizza');

const persistBookmark = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookMark = function (recipe) {
  state.bookmarks.push(recipe);
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;
  persistBookmark();
};

export const deleteBookmark = function (id) {
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index, 1);

  if (id === state.recipe.id) state.recipe.bookmarked = false;
  persistBookmark();
};

export const uploadRecipe = async function (newRecipe) {
  // localStorage.
  try {
    // console.log(Object.entries(newRecipe));
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].replaceAll(' ', '').split(',');
        console.log(ingArr);
        if (ingArr.length !== 3)
          throw new Error(
            'Wrong input format, Please try again with correct format ;)'
          );
        const [quantity, unit, description] = ingArr;
        return { quantity: quantity ? quantity : null, unit, description };
      });
    console.log(ingredients);

    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      cooking_time: newRecipe.cookingTime,
      publisher: newRecipe.publisher,
      servings: newRecipe.servings,
      ingredients,
    };

    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookMark(state.recipe);
  } catch (err) {
    throw err;
  }
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};
init();
