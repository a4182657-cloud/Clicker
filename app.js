const tg = window.Telegram.WebApp
tg.ready()
tg.expand()

// ---------- USER ----------
const user = tg.initDataUnsafe?.user
document.getElementById("user").innerText =
  user ? `Игрок: ${user.first_name}` : "Игрок: Гость"

// ---------- СОХРАНЕНИЕ ----------
const save = () => {
  localStorage.setItem("player", JSON.stringify(player))
  localStorage.setItem("cards", JSON.stringify(cards))
}

const load = () => {
  const p = localStorage.getItem("player")
  const c = localStorage.getItem("cards")
  if (p) Object.assign(player, JSON.parse(p))
  if (c) {
    const saved = JSON.parse(c)
    cards.forEach(card => {
      const s = saved.find(x => x.id === card.id)
      if (s) card.level = s.level
    })
  }
}

// ---------- СОСТОЯНИЕ ----------
const player = {
  coins: 0,
  totalEarned: 0,
  level: 1,
  clickPower: 1
}

// ---------- КАРТОЧКИ ----------
const cards = [
  { id: 1, name: "Ферма", basePrice: 50, incomePerSecond: 1, level: 0 },
  { id: 2, name: "Завод", basePrice: 200, incomePerSecond: 5, level: 0, unlockLevel: 3 }
]

// ---------- ЛОГИКА ----------
function clickCoin() {
  player.coins += player.clickPower
  player.totalEarned += player.clickPower
  updateLevel()
  save()
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
    save()
    render()
  }
}

// ---------- ПАССИВ ----------
setInterval(() => {
  let income = 0
  cards.forEach(c => income += c.incomePerSecond * c.level)
  player.coins += income
  player.totalEarned += income
  updateLevel()
  save()
  render()
}, 1000)

// ---------- UI ----------
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
        Цена: ${cardPrice(card)}<br>
        <button onclick="buyCard(${card.id})">Купить</button>
      </div>
    `
  })
}

load()
render()
