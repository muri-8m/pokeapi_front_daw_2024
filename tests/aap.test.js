// tests/aap.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import App from '../src/App.vue';
import HomeView from '../src/views/HomeView.vue';
import PokemonDetail from '../src/views/PokemonDetail.vue';
import { nextTick } from 'vue';

// Mock router
const mockPush = vi.fn();
vi.mock('../src/router/shim', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => ({ value: { params: { id: '1' } } }),
}));

// Datos de ejemplo para fetch
const mockPokemonList = [
  { id: '1', name: 'pikachu', img: 'pikachu.png' },
  { id: '2', name: 'charmander', img: 'charmander.png' },
];

const mockPokemonDetail = {
  id: 1,
  name: 'pikachu',
  sprites: {
    front_default: 'pikachu_front.png',
    back_default: 'pikachu_back.png',
    other: { 'official-artwork': { front_default: 'pikachu_art.png' } },
  },
  types: [{ slot: 1, type: { name: 'electric' } }],
  abilities: [{ ability: { name: 'static' } }],
  stats: [{ stat: { name: 'speed' }, base_stat: 90 }],
  moves: [{ move: { name: 'thunderbolt' } }],
  species: { url: 'https://pokeapi.co/api/v2/pokemon-species/1/' },
};

const mockSpecies = {
  flavor_text_entries: [
    { language: { name: 'es' }, flavor_text: 'Pokémon ratón eléctrico.' },
  ],
};

vi.stubGlobal('fetch', vi.fn((url) => {
  if (url.includes('/pokemon/?')) {
    return Promise.resolve({
      json: () => Promise.resolve({
        results: [
          { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
          { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
        ],
      }),
    });
  }
  if (url.includes('/pokemon/1')) {
    return Promise.resolve({ json: () => Promise.resolve(mockPokemonDetail) });
  }
  if (url.includes('/pokemon-species/1')) {
    return Promise.resolve({ json: () => Promise.resolve(mockSpecies) });
  }
  if (url.includes('/pokemon/2')) {
    return Promise.resolve({ json: () => Promise.resolve({
      id: 2,
      name: 'charmander',
      sprites: { front_default: 'charmander.png' },
    })});
  }
  return Promise.reject(new Error('Not found'));
}));

describe('App.vue', () => {
  it('se monta correctamente', () => {
    const wrapper = mount(App);
    expect(wrapper.exists()).toBe(true);
  });
});

describe('HomeView.vue', () => {
  let wrapper;

  beforeEach(async () => {
    wrapper = mount(HomeView);
    await nextTick(); // permite que onMounted() se ejecute
    await new Promise((r) => setTimeout(r, 0)); // resolver Promise.all
    await nextTick();
  });

it('muestra estado de carga inicialmente', async () => {
  const wrapper = mount(HomeView, {
    data() {
      return {
        isLoading: true, // Forzamos que el estado de carga esté activo
      };
    },
  });

  await nextTick();

  const loadingDiv = wrapper.find('.loading-state');
  expect(loadingDiv.exists()).toBe(true);
});




  it('renderiza la lista de pokémon', () => {
    const html = wrapper.html();
    expect(html).toContain('pikachu');
    expect(html).toContain('charmander');
  });

  it('maneja mensaje de error', async () => {
    wrapper.vm.errorMessage = 'Error al cargar';
    await nextTick();
    expect(wrapper.html()).toContain('Error al cargar');
  });
});

describe('PokemonDetail.vue', () => {
  let wrapper;

  beforeEach(async () => {
    wrapper = mount(PokemonDetail);
    await nextTick();
    await new Promise((r) => setTimeout(r, 0));
    await nextTick();
  });

  it('muestra estado de carga si no hay pokemon', async () => {
    wrapper.vm.pokemon = null;
    await nextTick();
    expect(wrapper.html()).toContain('Cargando información del pokémon...');
  });

  it('renderiza detalles de pokémon', () => {
    wrapper.vm.pokemon = mockPokemonDetail;
    wrapper.vm.species = mockSpecies;
    return nextTick().then(() => {
      const html = wrapper.html();
      expect(html).toContain('Pikachu');
      expect(html).toContain('Pokémon ratón eléctrico.');
      expect(html).toContain('electric');
      expect(html).toContain('static');
      expect(html).toContain('speed');
      expect(html).toContain('thunderbolt');
    });
  });
});
