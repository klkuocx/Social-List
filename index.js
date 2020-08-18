const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'
const REGION_URL = 'https://restcountries.eu/rest/v2/region/'


// {MVC Framework}

const model = {
  USERS_PER_PAGE: 12,
  numberOfPages: 0,
  currentPage: 1,

  users: [],
  filteredUsers: [],

  genderNow: 'all',
  ageRangeNow: [18, 80],
  keywordNow: '',

  countryCodes: {
    Africa: [],
    Americas: [],
    Asia: [],
    Europe: [],
    Oceania: [],
  },
  regionNow: ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania'],
  filteredCountries: [],

  // [Functions]
  // Filter All Data
  filterAll() { // Search, Age, Region 篩選結果為 0 時的 BUG 待解
    model.switchUsersByGender()
    model.filterUsersByAge()

    model.filterUsersByRegion()
    model.searchUsersByName()
    model.updateNumberOfPages(model.filteredUsers.length)
  },
  resetFilteredUsers() {
    model.filteredUsers = []
  },

  // Update Gender Data
  switchUsersByGender() {
    const data = model.filteredUsers.length ? model.filteredUsers : model.users
    if (model.genderNow === 'all') {
      model.filteredUsers = data
    } else {
      model.filteredUsers = data.filter(user => user.gender === model.genderNow)
    }
  },
  updateGender(data) {
    model.genderNow = data
  },

  // Update Age Data
  filterUsersByAge() {
    const data = model.filteredUsers.length ? model.filteredUsers : model.users
    model.filteredUsers = data.filter(user => user.age <= model.ageRangeNow[1] && user.age >= model.ageRangeNow[0])
  },
  updateAgeRange(number, value) {
    model.ageRangeNow[number] = value
  },

  // Update Search Data
  searchUsersByName() {
    const data = model.filteredUsers.length ? model.filteredUsers : model.users
    model.filteredUsers = data.filter(user => user.name.toLowerCase().includes(model.keywordNow))
  },
  updateKeyword(keyword) {
    model.keywordNow = keyword
  },

  // Update Region Data
  getCountryCodesOfRegion(region, arr) { // Get Region API
    model.countryCodes[`${region}`] = arr.map(item => item.alpha2Code)
  },
  filterUsersByRegion() {
    const data = model.filteredUsers.length ? model.filteredUsers : model.users
    model.filteredUsers = data.filter(user => model.filteredCountries.includes(user.region))
  },
  updateRegionNow(regionSelected) {
    if (model.regionNow.includes(regionSelected)) {
      model.regionNow = model.regionNow.filter(region => region !== regionSelected)
    } else {
      model.regionNow.push(regionSelected)
    }
  },
  updateFilteredCountries(...regions) { // regionNow
    model.resetFilteredCountries()
    regions.forEach(region => {
      model.combineCountryCodes(region, model.countryCodes)
    })
  },
  combineCountryCodes(region, arr) {
    model.filteredCountries = model.filteredCountries.concat(arr[`${region}`])
  },
  resetFilteredCountries() {
    model.filteredCountries = []
  },

  // Update Page Data
  getUsersByPage(page) {
    const data = model.filteredUsers.length ? model.filteredUsers : model.users
    const startIndex = (page - 1) * model.USERS_PER_PAGE
    return data.slice(startIndex, startIndex + model.USERS_PER_PAGE)
  },
  updateNumberOfPages(amount) {
    model.numberOfPages = Math.ceil(amount / model.USERS_PER_PAGE)
  },
  updateCurrentPage(page) {
    model.currentPage = page
  },
}

const view = {
  // Elements
  dataPanel: document.querySelector('#data-panel'),
  paginator: document.querySelector('#paginator'),
  ageSlider: document.querySelector('#age-slider'),
  ageTop: document.querySelector('#age-top'),
  ageBtm: document.querySelector('#age-btm'),
  genderSwitcher: document.querySelector('#gender-switcher'),
  userName: document.querySelector('#modal-user-name'),
  userGender: document.querySelector('#modal-user-gender'),
  userAge: document.querySelector('#modal-user-age'),
  userRegion: document.querySelector('#modal-user-region'),
  userBirthday: document.querySelector('#modal-user-birthday'),
  searchForm: document.querySelector('#search-form'),
  searchInput: document.querySelector('#search-input'),
  regionFilter: document.querySelector('#region-filter'),

  // [Functions]
  // Render User
  renderUserList(data) {
    view.dataPanel.innerHTML = data.map(item => this.getUserElement(item)).join('')
  },

  getUserElement(item) {
    return `<div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-2">
        <div class="card text-center text-white bg-dark">
          <img src="${item.avatar}" class="card-img-top" alt="${item.name}-avatar">
          <div class="card-body">
            <h5 class="card-title">${item.name}</h5>
            <div class="d-flex flex-wrap justify-content-center justify-content-lg-between">
              ${this.getAddFavoriteBtn(item.id)}
              <button type="button" class="btn btn-outline-light btn-show-info m-1" data-id="${item.id}">Info</button>
            </div>
          </div>
        </div>
      </div>`
  },

  getAddFavoriteBtn(id) {  // update on 8/16
    const list = JSON.parse(localStorage.getItem('favoriteList')) || []

    if (list.some(user => user.id === id)) {
      return `<button type="button" class="btn btn-outline-danger btn-add-favorite m-1 active" data-id="${id}">Like</button>`
    }
    return `<button type="button" class="btn btn-outline-danger btn-add-favorite m-1" data-id="${id}">Like</button>`
  },

  // Render Paginator
  renderPaginator(totalAmount, selectPage) {
    let rawHTML = ''

    rawHTML += view.getPreviousPageItem(selectPage)
    rawHTML += totalAmount < 7 ? view.getPageItems(totalAmount, selectPage) : view.getLessPageItems(totalAmount, selectPage)
    rawHTML += view.getNextPageItem(totalAmount, selectPage)

    view.paginator.innerHTML = rawHTML
  },

  // Two different size of paginators
  getPageItems(totalAmount, selectPage) {
    let rawHTML = ''
    for (let page = 1; page <= totalAmount; page++) {
      if (page === selectPage) {
        rawHTML += view.getCurrentPageItem(page)
      } else {
        rawHTML += view.getPageItem(page)
      }
    }
    return rawHTML
  },
  getLessPageItems(totalAmount, selectPage) {
    let rawHTML = ''

    if ((selectPage > 3) && (selectPage < (totalAmount - 3))) {
      rawHTML += view.getEllipsisItem()
      for (let page = selectPage - 2; page <= selectPage + 2; page++) {
        if (page === selectPage) {
          rawHTML += view.getCurrentPageItem(page)
        } else {
          rawHTML += view.getPageItem(page)
        }
      }
      rawHTML += view.getEllipsisItem()
    } else if (selectPage <= 3) {
      for (let page = 1; page <= 5; page++) {
        if (page === selectPage) {
          rawHTML += view.getCurrentPageItem(page)
        } else {
          rawHTML += view.getPageItem(page)
        }
      }
      rawHTML += view.getEllipsisItem()
    } else {
      rawHTML += view.getEllipsisItem()
      for (let page = totalAmount - 4; page <= totalAmount; page++) {
        if (page === selectPage) {
          rawHTML += view.getCurrentPageItem(page)
        } else {
          rawHTML += view.getPageItem(page)
        }
      }
    }
    return rawHTML
  },

  // 各種 PageItem
  getPageItem(page) {
    return `<li class="page-item"><a class="page-link" href="javascript:;" data-page="${page}">${page}</a></li>`
  },

  getCurrentPageItem(page) {
    return `<li class="page-item active" aria-current="page">
        <span class="page-link">
          ${page}<span class="sr-only">(current)</span>
        </span>
      </li>`
  },

  getPreviousPageItem(page) {
    if (page === 1) {
      return view.previousPageItem('disabled')
    } else {
      return view.previousPageItem()
    }
  },

  previousPageItem(disabled) {
    return `<li class="page-item ${disabled}">
        <a id="previousPage" class="page-link" href="javascript:;" aria-label="Previous">
          <span id="previousPage" aria-hidden="true">&laquo;</span>
        </a>
      </li>`
  },

  getNextPageItem(amount, page) {
    if (page === amount) {
      return view.nextPageItem('disabled')
    } else {
      return view.nextPageItem()
    }
  },

  nextPageItem(disabled) {
    return `<li class="page-item ${disabled}">
        <a id="nextPage" class="page-link" href="javascript:;" aria-label="Next">
          <span id="nextPage" aria-hidden="true">&raquo;</span>
        </a>
      </li>`
  },

  getEllipsisItem() {
    return `<li class="page-item disabled">
        <span class="page-link">...</span>
      </li>`
  },

  // age span
  renderAgeSpan(target, value) {
    target.innerText = value
  },

  // model
  renderUserModal(data) {
    view.userName.innerText = data.name
    view.userGender.innerText = data.gender
    view.userAge.innerText = data.age
    view.userRegion.innerText = data.region
    view.userBirthday.innerText = data.birthday
  },

  // search bar
  clearSearchInput() {
    view.searchInput.value = ''
  },
  showSearchAlert(results, keyword) {
    if (results === 0)
      return alert(`Can't find the name including ${keyword}`)
  },

  // AddFavoriteBtn
  activeAddFavoriteBtn(target) { // update on 8/16
    target.classList.add('active')
  },
}

const controller = {
  // init
  init() {
    this.initDataAndInterface()
    this.getCountryCodesOfAll(...model.regionNow)
    this.initEventListeners()
  },

  initDataAndInterface() {
    axios
      .get(INDEX_URL)
      .then(resp => {
        // Get Data
        model.users.push(...resp.data.results)
        model.updateNumberOfPages(model.users.length)
        // Render View
        view.renderPaginator(model.numberOfPages, model.currentPage)
        view.renderUserList(model.getUsersByPage(model.currentPage))
      })
      .catch(err => console.log(err))
  },

  getCountryCodesOfAll(...regions) {
    regions.forEach(region => {
      axios
        .get(REGION_URL + region)
        .then(resp => {
          model.getCountryCodesOfRegion(region, resp.data)
          model.combineCountryCodes(region, model.countryCodes)
        })
        .catch(err => console.log(err))
    })
  },

  initEventListeners() {
    // Like & Info Button
    view.dataPanel.addEventListener('click', function onPanelClicked(event) {
      if (event.target.matches('.btn-show-info')) {
        controller.showUserModal(event.target.dataset.id)
      } else if (event.target.matches('.btn-add-favorite')) {
        controller.addToFavorite(Number(event.target.dataset.id), event.target)
      }
    })

    // Change Age Range
    view.ageSlider.addEventListener('input', function onSliderInputed(event) {
      const inputValue = Number(event.target.value)

      model.resetFilteredUsers()
      if (event.target.matches('#range-top-input')) {
        model.updateAgeRange(1, inputValue)
        view.renderAgeSpan(view.ageTop, inputValue)
      } else if (event.target.matches('#range-btm-input')) {
        model.updateAgeRange(0, inputValue)
        view.renderAgeSpan(view.ageBtm, inputValue)
      }
      model.filterAll()
      model.updateNumberOfPages(model.filteredUsers.length)
      model.updateCurrentPage(1)

      view.renderPaginator(model.numberOfPages, model.currentPage)
      view.renderUserList(model.getUsersByPage(model.currentPage))
    })

    // Switch Gender
    view.genderSwitcher.addEventListener('click', function onSwitcherClicked(event) {
      if (event.target.tagName !== 'I') return

      model.resetFilteredUsers()
      model.updateGender(event.target.dataset.gender)
      model.filterAll()
      model.updateNumberOfPages(model.filteredUsers.length)
      model.updateCurrentPage(1)

      view.renderPaginator(model.numberOfPages, model.currentPage)
      view.renderUserList(model.getUsersByPage(model.currentPage))
    })

    // Search Form
    view.searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
      event.preventDefault()
      const keyword = view.searchInput.value.trim().toLowerCase()

      model.resetFilteredUsers()
      model.updateKeyword(keyword)
      model.filterAll()
      model.updateNumberOfPages(model.filteredUsers.length)
      model.updateCurrentPage(1)

      view.clearSearchInput()
      view.showSearchAlert(model.filteredUsers.length, model.keywordNow)
      view.renderPaginator(model.numberOfPages, model.currentPage)
      view.renderUserList(model.getUsersByPage(model.currentPage))
    })

    // Region Filter
    view.regionFilter.addEventListener('click', function onRegionFilterClicked(event) {
      if (event.target.tagName !== 'INPUT') return
      const regionSelected = event.target.id

      model.resetFilteredUsers()
      model.updateRegionNow(regionSelected)
      model.updateFilteredCountries(...model.regionNow)
      model.filterAll()
      model.updateNumberOfPages(model.filteredUsers.length)
      model.updateCurrentPage(1)

      view.renderPaginator(model.numberOfPages, model.currentPage)
      view.renderUserList(model.getUsersByPage(model.currentPage))
    })

    // Change Page
    view.paginator.addEventListener('click', function onPaginatorClicked(event) {
      event.preventDefault()

      if (event.target.tagName !== 'A' && event.target.tagName !== 'SPAN') return
      const id = event.target.id
      const page = Number(event.target.dataset.page)

      if (id === 'nextPage') {
        model.updateCurrentPage(model.currentPage + 1)
      } else if (id === 'previousPage') {
        model.updateCurrentPage(model.currentPage - 1)
      } else {
        model.updateCurrentPage(page)
      }

      view.renderPaginator(model.numberOfPages, model.currentPage)
      view.renderUserList(model.getUsersByPage(model.currentPage))
    })
  },

  // About Modal
  showUserModal(id) {
    axios
      .get(INDEX_URL + id)
      .then(resp => {
        view.renderUserModal(resp.data)
        // 解決非同步問題，跑完 API 才開啟 Modal
        $('#user-modal').modal('toggle')
      })
  },

  // About Favorite List
  addToFavorite(id, target) {
    const list = JSON.parse(localStorage.getItem('favoriteList')) || []
    const user = model.users.find((user) => user.id === id)

    if (list.some((user) => user.id === id)) {
      return alert('This person is already in your favorite list!')
    }

    list.push(user)
    localStorage.setItem('favoriteList', JSON.stringify(list))
    view.activeAddFavoriteBtn(target) // update on 8/16
  },
}

// [Main Program]
controller.init()
