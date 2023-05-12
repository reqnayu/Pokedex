function pokemonTemplate(
  {
    name,
    id,
    sprites: {
      front_default: img_fallback,
      other: {
        "official-artwork": {
          front_default: img_1 = "",
          front_shiny: img_2 = "",
        },
      },
    },
    types: [
      {
        type: { name: type_1 },
      },
      { type: { name: type_2 } = "" } = "",
    ],
  }
) {
  return /*html*/ `
        <div class="card loading" data-border="${type_1}" onclick="loadFullscreenCard(${id})">
          <div class="spinner"></div>
          <div class="image-container">  
            <div class="bg-img" style="--image: url(${img_1})" loading="lazy"></div>
            <img src="${img_2 || img_fallback}" onload="this.closest('.card').classList.remove('loading')">
          </div>
          <div class="info">
            <span class="index">#${generateIdString(id)}</span>
            <span class="name">${genderName(name)}</span>
            <div class="typeContainer">${renderTypes(type_1, type_2)}</div>
          </div>
        </div>
        `;
}

function statsTemplate(hp, attack, defense, specialAttack, specialDefence, speed) {
  return /*html*/`
        <div class="stats">
          <div>
            <div class="pie" style="--p: ${hp / 255}" data-stat="${hp}"></div>
            <span>HP</span>  
          </div>
          <div>
            <div class="pie" style="--p: ${
              attack / 181
            }" data-stat="${attack}"></div>
            <span>ATK</span>  
          </div>
          <div>
            <div class="pie" style="--p: ${
              defense / 230
            }" data-stat="${defense}"></div>
            <span>DEF</span>  
          </div>
          <div>
            <div class="pie" style="--p: ${
              specialAttack / 173
            }" data-stat="${specialAttack}"></div>
            <span>S-ATK</span>  
          </div>
          <div>
            <div class="pie" style="--p: ${
              specialDefence / 230
            }" data-stat="${specialDefence}"></div>
            <span>S-DEF</span>  
          </div>
          <div>
            <div class="pie" style="--p: ${
              speed / 160
            }" data-stat="${speed}"></div>
            <span>SPD</span>  
          </div>
        </div>
      `;
}

async function evolutionTemplate(evolution) {
  if (!evolution) return;
  const { id } = await getData(`https://pokeapi.co/api/v2/pokemon/${evolution}`)
  return /*html*/`
    <div class="evolution" onclick="loadFullscreenCard(${id})">
      <img src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png' alt="">
      <div class="evolution-name">${capitalize(evolution)}</div>
    </div>
  `
}
