import start from '../static/lib/tutorials/en_US/'

export const state = () => ({
  page: start.gettingStarted.default,
  community: "contribute",
  ecosystem: "bell",
  display: "home",
  language: "en_US"
})

export const mutations = {
  setPage (state, page) {
    state.page = page
  },
  setCommunity (state, community) {
    state.community = community
  },
  setEcosystem (state, ecosystem) {
    state.ecosystem = ecosystem
  },
  setDisplay (state, display) {
    state.display = display
  },
  setLanguage (state, language) {
    state.language = language
  }
}

export const getters = {
  loadPage (state) {
    return state.page
  },
  loadCommunity (state) {
    return state.community
  },
  loadEcosystem (state) {
    return state.ecosystem
  },
  loadDisplay (state) {
    return state.display
  },
  loadLanguage (state) {
    return state.language
  }
}