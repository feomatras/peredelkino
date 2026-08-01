// ============================================================
// ДАННЫЕ (с вашими картинками)
// ============================================================

const products = [
    { 
        id: 1, 
        name: 'Стол обеденный', 
        price: 3000, 
        category: 'Мебель', 
        stock: { moscow: 10, novosibirsk: 3 }, 
        image: 'https://cont.ws/uploads/pic/2020/11/5%20%284%29.webp'
    },
    { 
        id: 2, 
        name: 'Стул', 
        price: 2000, 
        category: 'Мебель', 
        stock: { moscow: 15, novosibirsk: 0 }, 
        image: 'https://i.pinimg.com/originals/3c/12/cf/3c12cf00ac55e7672aa5355d47a02555.jpg?nii=t'
    },
    { 
        id: 3, 
        name: 'Ламинат дуб', 
        price: 1200, 
        category: 'Напольные покрытия', 
        stock: { moscow: 50, novosibirsk: 20 }, 
        image: 'https://imageproxy.idaprikol.ru/crop:x-20,resize:640x,quality:90x75/images/5a33ef80fd48c8b7ee14ce89f180876a3169977390694a6d90ab61e19a7b3e26_1.jpg'
    },
    { 
        id: 4, 
        name: 'Краска белая', 
        price: 450, 
        category: 'Краски', 
        stock: { moscow: 100, novosibirsk: 60 }, 
        image: 'https://avatars.mds.yandex.net/get-mpic/5234050/img_id8322660951622119429.png/orig'
    },
    { 
        id: 5, 
        name: 'Диван угловой', 
        price: 15000, 
        category: 'Мебель', 
        stock: { moscow: 2, novosibirsk: 0 }, 
        image: 'https://avatars.mds.yandex.net/i?id=e448c5a34e745d088b36a71ec7e4528f6051eef3-5360274-images-thumbs&n=13'
    },
];

// ============================================================
// РАБОТА С КОРЗИНОЙ (с сохранением в localStorage)
// ============================================================

let cart = [];

function loadCart() {
    const saved = localStorage.getItem('cart');
    if (saved) {
        try { cart = JSON.parse(saved); } catch (e) { cart = []; }
    } else { cart = []; }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    saveCart();
    updateCartBadge();
    alert(`${product.name} добавлен в корзину!`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCart();
    updateCartBadge();
}

function updateQty(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
        cart = cart.filter(i => i.id !== productId);
    }
    saveCart();
    renderCart();
    updateCartBadge();
}

function getTotal() {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function updateCartBadge() {
    const badge = document.querySelector('.cart-icon .badge');
    if (badge) {
        const totalQty = cart.reduce((s, i) => s + i.qty, 0);
        badge.textContent = totalQty;
    }
}

// ============================================================
// СТРАНИЦА КОРЗИНЫ
// ============================================================

function renderCart() {
    const container = document.getElementById('cart-items');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = '<p>Корзина пуста.</p>';
        const totalEl = document.getElementById('cart-total');
        if (totalEl) totalEl.innerHTML = 'Итого: 0 ₽';
        const warning = document.getElementById('min-sum-warning');
        if (warning) warning.classList.remove('visible');
        return;
    }

    let html = '';
    cart.forEach(item => {
        html += `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}">
                <div class="info">
                    <h4>${item.name}</h4>
                    <div class="price">${item.price} ₽</div>
                </div>
                <div class="qty">
                    <button onclick="updateQty(${item.id}, -1)">−</button>
                    <span>${item.qty}</span>
                    <button onclick="updateQty(${item.id}, 1)">+</button>
                </div>
                <span class="remove" onclick="removeFromCart(${item.id})">✕</span>
            </div>
        `;
    });

    container.innerHTML = html;

    const total = getTotal();
    const totalEl = document.getElementById('cart-total');
    if (totalEl) {
        const delivery = total >= 1000 ? 150 : 0;
        const finalTotal = total + delivery;
        let deliveryText = total >= 1000 ? '150 ₽' : 'Бесплатно (самовывоз)';
        totalEl.innerHTML = `
            <div style="font-size:16px; font-weight:400; margin-bottom:8px;">
                Товары: ${total} ₽<br>
                Доставка: ${deliveryText}
            </div>
            <span>Итого: ${finalTotal} ₽</span>
        `;
    }

    const warning = document.getElementById('min-sum-warning');
    if (warning) {
        if (total < 1000) {
            warning.classList.add('visible');
        } else {
            warning.classList.remove('visible');
        }
    }
}

// ============================================================
// ВЫБОР ГОРОДА
// ============================================================

const citySelect = document.getElementById('citySelect');

function getCurrentCity() {
    return citySelect ? citySelect.value : 'moscow';
}

function updateStockDisplay() {
    const city = getCurrentCity();
    document.querySelectorAll('.product-card .stock').forEach(el => {
        const productId = parseInt(el.dataset.productId);
        const product = products.find(p => p.id === productId);
        if (!product) return;
        const count = product.stock[city] || 0;
        if (count > 0) {
            el.textContent = `В наличии: ${count} шт.`;
            el.className = 'stock in-stock';
        } else {
            el.textContent = 'Нет в наличии';
            el.className = 'stock out-of-stock';
        }
    });
}

if (citySelect) {
    citySelect.addEventListener('change', () => {
        localStorage.setItem('city', citySelect.value);
        updateStockDisplay();
        if (document.getElementById('product-stock')) {
            updateProductStock();
        }
    });
}

const savedCity = localStorage.getItem('city');
if (savedCity && citySelect) {
    citySelect.value = savedCity;
}

// ============================================================
// КАТАЛОГ: ФИЛЬТРЫ
// ============================================================

function applyFilters() {
    const categoryFilter = document.getElementById('filterCategory')?.value || 'all';
    const inStockOnly = document.getElementById('filterStock')?.checked || false;
    const priceMax = parseInt(document.getElementById('filterPrice')?.value || 30000);
    const city = getCurrentCity();

    document.querySelectorAll('.product-card').forEach(card => {
        const productId = parseInt(card.dataset.productId);
        const product = products.find(p => p.id === productId);
        if (!product) { card.style.display = 'none'; return; }

        let visible = true;
        if (categoryFilter !== 'all' && product.category !== categoryFilter) visible = false;
        if (product.price > priceMax) visible = false;
        if (inStockOnly) {
            const stockCount = product.stock[city] || 0;
            if (stockCount <= 0) visible = false;
        }
        card.style.display = visible ? '' : 'none';
    });
}

// ============================================================
// ПРОМОКОД
// ============================================================

function applyPromo() {
    const input = document.getElementById('promo-input');
    if (!input) return;
    const code = input.value.trim().toUpperCase();

    if (code === 'FIRST') {
        const total = getTotal();
        const discount = Math.round(total * 0.10);
        const newTotal = total - discount;
        const totalEl = document.getElementById('cart-total');
        if (totalEl) {
            totalEl.innerHTML = `
                <div style="font-size:16px; font-weight:400; margin-bottom:8px;">
                    Товары: ${total} ₽<br>
                    Скидка: -${discount} ₽
                </div>
                <span>Итого: ${newTotal} ₽</span>
            `;
        }
        alert(`Промокод применён! Скидка ${discount} ₽`);
    } else {
        alert('Промокод недействителен');
    }
}

// ============================================================
// СТРАНИЦА ТОВАРА
// ============================================================

function updateProductStock() {
    const productId = parseInt(document.getElementById('product-id')?.value || 1);
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const city = getCurrentCity();
    const stockEl = document.getElementById('product-stock');
    if (!stockEl) return;

    const count = product.stock[city] || 0;
    if (count > 0) {
        stockEl.textContent = `В наличии: ${count} шт.`;
        stockEl.className = 'in-stock';
    } else {
        stockEl.textContent = 'Нет в наличии';
        stockEl.className = 'out-of-stock';
    }
}

// ============================================================
// ОФОРМЛЕНИЕ: ВАЛИДАЦИЯ
// ============================================================

function validateCheckout() {
    const phone = document.getElementById('phone');
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const address = document.getElementById('address');

    let valid = true;

    if (!name.value.trim()) {
        showError(name, 'Введите ФИО');
        valid = false;
    } else {
        hideError(name);
    }

    const phoneClean = phone.value.replace(/[^0-9]/g, '');
    if (phoneClean.length < 10) {
        showError(phone, 'Введите корректный номер телефона');
        valid = false;
    } else {
        hideError(phone);
    }

    const emailValue = email.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValue || !emailPattern.test(emailValue)) {
        showError(email, 'Введите корректный email (например, name@mail.ru)');
        valid = false;
    } else {
        hideError(email);
    }

    if (!address.value.trim()) {
        showError(address, 'Введите адрес доставки');
        valid = false;
    } else {
        hideError(address);
    }

    if (!valid) {
        alert('Пожалуйста, исправьте ошибки в форме');
        return false;
    }

    const total = getTotal();
    if (total < 1000) {
        alert('Минимальная сумма заказа для доставки — 1000 ₽. Добавьте товары или выберите самовывоз.');
        return false;
    }

    window.location.href = 'confirmation.html';
    return false;
}

function showError(input, message) {
    input.classList.add('error-input');
    const errorEl = document.getElementById(input.id + '-error');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('visible');
    }
}

function hideError(input) {
    input.classList.remove('error-input');
    const errorEl = document.getElementById(input.id + '-error');
    if (errorEl) {
        errorEl.classList.remove('visible');
    }
}

// ============================================================
// ПОДТВЕРЖДЕНИЕ
// ============================================================

function generateOrderNumber() {
    const el = document.getElementById('order-number');
    if (el) {
        el.textContent = Math.floor(1000 + Math.random() * 9000);
    }
}

// ============================================================
// ЧАТ (модальное окно)
// ============================================================

function openChat() {
    const modal = document.getElementById('chatModal');
    if (modal) {
        modal.classList.add('active');
        const input = document.getElementById('chatInput');
        if (input) setTimeout(() => input.focus(), 100);
    }
}

function closeChat() {
    const modal = document.getElementById('chatModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    const body = document.getElementById('chatBody');
    if (!body) return;

    const userMsg = document.createElement('div');
    userMsg.className = 'message user';
    userMsg.textContent = text;
    body.appendChild(userMsg);

    input.value = '';

    setTimeout(() => {
        const botMsg = document.createElement('div');
        botMsg.className = 'message bot';
        botMsg.textContent = 'Спасибо за обращение! Мы ответим в ближайшее время.';
        body.appendChild(botMsg);
        body.scrollTop = body.scrollHeight;
    }, 600);

    body.scrollTop = body.scrollHeight;
}

// Закрытие чата по клику вне модального окна
document.addEventListener('click', function(event) {
    const modal = document.getElementById('chatModal');
    const chatButton = document.querySelector('.chat-button');
    if (!modal) return;
    if (modal.classList.contains('active')) {
        const isClickInside = modal.contains(event.target);
        const isClickOnButton = chatButton && chatButton.contains(event.target);
        if (!isClickInside && !isClickOnButton) {
            closeChat();
        }
    }
});

// ============================================================
// ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    updateCartBadge();
    renderCart();
    updateStockDisplay();
    updateProductStock();
    generateOrderNumber();
});