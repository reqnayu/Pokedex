let i = 0;
let j = 20;
let pokemons = 0;
let sortOrder = "numbers_ascending";
let currentPokemonId = 1;
let allPokemon;

const observer = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting) {
      next20();
    }
  },
  { rootMargin: "0px" }
);

const loadAllPokemon = async () => {
  const allPokemon = await fetch("https://pokeapi.co/api/v2/pokemon?offset=0&limit=1006");
  const {results} = await allPokemon.json();
  return results;
}

const getPokemonById = async (id) => await (await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)).json();

const sortPokemon = async () => {
  if (sortOrder == "numbers_ascending") return await sortByType(sortByNumbers, 1);
  if (sortOrder == "numbers_descending") return await sortByType(sortByNumbers, -1);
  if (sortOrder == "names_ascending") return await sortByType(sortByNames, 1);
  if (sortOrder == "names_descending") return await sortByType(sortByNames, -1);
}

const sortByType = async (cb, direction) => {
  const sortedPokemon = await loadAllPokemon();
  sortedPokemon.sort(cb);
  if (direction == -1) sortedPokemon.reverse();
  return sortedPokemon;
}

const sortByNames = ({name: name_1}, {name: name_2}) => name_1.localeCompare(name_2);

const sortByNumbers = ({url: url_1},{url: url_2}) => {
  const val_1 = getIdFromUrl(url_1);
  const val_2 = getIdFromUrl(url_2);
  if (val_1 > val_2) return 1
  else if (val_1 < val_2) return -1
  else return 0
}

const getIdFromUrl = (url) => {
  if (!url.match(/[0-9]/g)) {
    return url;
  }
  return parseInt(url.slice(url.indexOf("mon/")+3).match(/[0-9]/g).join(''))
}

const loadPokemon = async () => {
  observer.disconnect();
  allPokemon = await sortPokemon();
  qs('#container').classList.toggle('loading', true);
  for (i; pokemons < j && i < allPokemon.length; i++){
    if (validateFilter(allPokemon[i])) continue;
    const pokemon = await getData(allPokemon[i].url) || false;
    if (!pokemon) continue;
    renderPokemon(pokemon);
    pokemons++;
  }
  if (pokemons > 19) observer.observe(qs('#container .card:last-of-type'));
  qs('#container').classList.toggle('loading', false);
}

function validateFilter(input){
  const filter = qs('header input').value.toLowerCase();
  if (!filter) return false;
  if (input.url.slice(input.url.indexOf('mon/')+3).includes(filter.toString()) || input.name.includes(filter)) return false;
  return true;
}

const resetIterators = () => {
  i = 0;
  pokemons = 0;
  j = 20;
}

const searchFunction = debounce(() => {
    resetIterators();
    qs('#container').innerHTML = '';
    loadPokemon();
});

const getData = async url => {
  const api_call = await fetch(url);
  if (!api_call.ok) return 
  const api_data = await api_call.json();
  return api_data;
}

function renderPokemon(pokemon) {
  const container = qs("#container");
  container.innerHTML += pokemonTemplate(pokemon);
}

function renderTypes(type_1, type_2) {
  if (type_2 == undefined) {
    return `<div class="type" data-color-1="${type_1}">${capitalize(type_1)}</div>`;
  }
  return `
      <div class="type" data-color-1="${type_1}">${capitalize(type_1)}</div>
      <div class="type" data-color-1="${type_2}">${capitalize(type_2)}</div>
    `;
}

const next20 = () => {
  i = j;
  j += 20;
  pokemons = qAll('.card').length;
  loadPokemon();
}

async function loadEvolutions(i) {
  const {evolution_chain} = await getData(`https://pokeapi.co/api/v2/pokemon-species/${i}/`);
  if (!evolution_chain) return
  const {chain:
    {species:
      {name: firstEvolution}, evolves_to: [
        {species:
          { name: secondEvolution = "" } = "", evolves_to: [
            {species:
              { name: thirdEvolution = "" } = "" }  = ""
          ] = ""
        } = ""
      ]
    }
  } = await getData(evolution_chain.url);
  const evolutions = [firstEvolution, secondEvolution, thirdEvolution]
  if (evolutions[1]) renderEvolutions(evolutions);
}

async function renderEvolutions(evolutions) {
  qs('.fullscreen-card .main-card').innerHTML += `<div class="evolutions-wrapper"></div>`;
  for (const evolution of evolutions) {
    if (!evolution) return;
    qs('.fullscreen-card .main-card .evolutions-wrapper').innerHTML += await evolutionTemplate(evolution);
  }
}

const validateI = (i) => {
  vis(qs('.previous-pokemon'), i == 1);
  vis(qs('.next-pokemon'), i == allPokemon.length);
}

async function loadFullscreenCard(i) {
  validateI(i);
  if (event.currentTarget == qs('.fullscreen-card .card')) return;
  currentPokemonId = i;
  toggleScroll(true);
  vis(qs(".bg"), false);
  qs('.fullscreen-card .main-card').innerHTML = pokemonTemplate(await getPokemonById(i));

  const { stats } = await getData(`https://pokeapi.co/api/v2/pokemon/${i}/`);
  renderStats(stats)
  loadEvolutions(i);
}

function renderStats([
  { base_stat: hp },
  { base_stat: attack },
  { base_stat: defense },
  { base_stat: specialAttack },
  { base_stat: specialDefence },
  { base_stat: speed },
]) {
  const fullscreenCard = qs(".bg .card");
  fullscreenCard.innerHTML += statsTemplate(hp, attack, defense, specialAttack, specialDefence, speed);
}

function closeBg() {
  const bg = qs(".bg");
  if (event.target == event.currentTarget || event.target == qs('.close-btn')) {
    const card = bg.querySelector(".card");
    bg.classList.toggle("d-none", true);
    bg.querySelector(".main-card").innerHTML = '';
    toggleScroll(false);
  }
}

const toggleSortOptions = (event) => {
  event.currentTarget.classList.toggle('active')
  vis(qs('.sort-options'));
}

function showSearchbar() {
  qs('.searchbar').classList.toggle('special-d-none', false);
  qs('input').focus();
}

const resetSearch = () => {
  qs('.searchbar').classList.toggle('special-d-none', true);
  if (qs('input').value) {
    qs('header input').value = '';
    resetIterators();
    loadPokemon();
  }
}

const sortAndSearch = () => {
  const button = event.currentTarget;
  const menu = qs('.sort-options');
  const menuButton = qs('.sort');
  vis(menu);
  menuButton.classList.toggle('active');
  if(menuButton.querySelector('span').innerHTML == button.innerHTML) return;
  menuButton.querySelector('span').innerHTML = button.innerHTML;
  sortOrder = button.value;
  resetIterators();
  qs('#container').innerHTML = '';
  loadPokemon();
}

const toggleScroll = function (bool) {
  if (bool) {
    window.addEventListener("wheel", wheelTouchBlock, {passive: false});
    window.addEventListener("keydown", keyScrollBlock, {passive: false});
    window.addEventListener("touchmove", wheelTouchBlock, {passive: false});
    return;
  }
  if (!bool) {
    window.removeEventListener("wheel", wheelTouchBlock, {passive: false});
    window.removeEventListener("keydown", keyScrollBlock, {passive: false});
    window.removeEventListener("touchmove", wheelTouchBlock, {passive: false});
  }
}

const keyScrollBlock = function (e) {
  if (e.key == "ArrowDown" || e.key == "ArrowUp")
  e.preventDefault();
  return;
}

const wheelTouchBlock = function (e) {
  e.preventDefault();
}

function generateIdString(id) {
  return "0000".slice(id.toString().length) + id;
}

function genderName(name) {
  return capitalize(name).replace(/\s[m]$/i, ` <span data-m>&nbsp;♂&nbsp</span>`).replace(/\s[f]$/i,` <span data-f>&nbsp♀&nbsp</span>`)
}