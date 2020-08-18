const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'

const model = {
  users: JSON.parse(localStorage.getItem('favoriteList')),
}

const view = {
  // Element
  dataPanel: document.querySelector('#data-panel'),
  userName: document.querySelector('#modal-user-name'),
  userGender: document.querySelector('#modal-user-gender'),
  userAge: document.querySelector('#modal-user-age'),
  userRegion: document.querySelector('#modal-user-region'),
  userBirthday: document.querySelector('#modal-user-birthday'),

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
              <button type="button" class="btn btn-outline-danger btn-add-favorite m-1" data-id="${item.id}">X</button>
              <button type="button" class="btn btn-outline-light btn-show-info m-1" data-id="${item.id}">Info</button>
            </div>
          </div>
        </div>
      </div>`
  },

  // model
  renderUserModal(data) {
    view.userName.innerText = data.name
    view.userGender.innerText = data.gender
    view.userAge.innerText = data.age
    view.userRegion.innerText = data.region
    view.userBirthday.innerText = data.birthday
  },
}

const controller = {
  init() {
    view.renderUserList(model.users)
    controller.initEventListeners()
  },

  initEventListeners() {
    // Like & Info Button
    view.dataPanel.addEventListener('click', function onPanelClicked(event) {
      if (event.target.matches('.btn-show-info')) {
        controller.showUserModal(event.target.dataset.id)
      } else if (event.target.matches('.btn-add-favorite')) {
        controller.removeFromFavorite(Number(event.target.dataset.id))
      }
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
  removeFromFavorite(id) {
    if (!model.users) return

    const userIndex = model.users.findIndex((user) => user.id === id)
    if (userIndex === -1) return

    model.users.splice(userIndex, 1)
    localStorage.setItem('favoriteList', JSON.stringify(model.users))

    view.renderUserList(model.users)
  },
}

controller.init()
