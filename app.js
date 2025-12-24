// ================= TELEGRAM =================
const tg = window.Telegram.WebApp
tg.ready()
tg.expand()

const tgUser = tg.initDataUnsafe?.user
const userId = tgUser ? tgUser.id : "guest"
const STORAGE_KEY = "clicker_" + userId

// ================= PLAYER =================
const player = {
  coins: 0,
  totalEarned: 0,
  level: 1,
  clickPower: 1
}

// ================= CARDS =================
const cards = [
  { id: 1, name: "Ферма", basePrice: 50, incomePerSecond: 1, level: 0 },
  { id: 2, name: "Завод", basePrice: 200, incomePerSecond: 5, level: 0, unlockLevel: 3 }
]

// ================= SAVE / LOAD =================
function saveGame() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ player, cards })
  )
}

function loadGame() {
  const data = localStorage.getItem(STORAGE_KEY)
  if (!data) return

  const parsed = JSON.parse(data)

  Object.assign(player, parsed.player)

  parsed.cards.forEach(saved => {
    const card = cards.find(c => c.id === saved.id)
    if (card) card.level = saved.level
  })
}

// ================= GAME LOGIC =================
function clickCoin() {
  player.coins += player.clickPower
  player.totalEarned += player.clickPower
  updateLevel()
  saveGame()
  render()
}

function updateLevel() {
  player.level = Math.floor(player.totalEarned / 100) + 1
}

function cardPrice(card) {
  return Math.floor(card.basePrice * Math.pow(1.15, card.level))
}

function buyCard(id) {
  const card = cards.find(c => c.id === id)
  const price = cardPrice(card)

  if (player.coins >= price) {
    player.coins -= price
    card.level++
    saveGame()
    render()
  }
}

// ================= PASSIVE INCOME =================
setInterval(() => {
  let income = 0
  cards.forEach(c => income += c.incomePerSecond * c.level)

  player.coins += income
  player.totalEarned += income
  updateLevel()
  saveGame()
  render()
}, 1000)

// ================= RENDER =================
function render() {
  document.getElementById("coins").innerText = player.coins
  document.getElementById("level").innerText = player.level

  const cardsDiv = document.getElementById("cards")
  cardsDiv.innerHTML = ""

  cards.forEach(card => {
    if (card.unlockLevel && player.level < card.unlockLevel) return

    cardsDiv.innerHTML += `
      <div class="card">
        <b>${card.name}</b><br>
        Уровень: ${card.level}<br>
        Доход: ${card.level * card.incomePerSecond}/сек<br>
        Цена: ${cardPrice(card)}
        <button onclick="buyCard(${card.id})">Купить</button>
      </div>
    `
  })
}

// ================= INIT =================
window.onload = () => {
  loadGame()
  render()
}
