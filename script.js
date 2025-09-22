let cart = [];

function selectSize(button, price) {
    const parent = button.parentElement;
    parent.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');

    const priceSpan = parent.parentElement.querySelector('.price');
    priceSpan.textContent = `R$ ${price.toFixed(2)}`;
}

function toggleComplemento(span) {
    span.classList.toggle('selected');

    const itemInfo = span.closest('.item-info');
    const basePrice = parseFloat(itemInfo.querySelector('.size-btn.selected').dataset.price);
    const qtdComplementos = itemInfo.querySelectorAll('.complemento.selected').length;
    const finalPrice = basePrice + qtdComplementos * 2;

    const priceSpan = itemInfo.querySelector('.price');
    priceSpan.textContent = `R$ ${finalPrice.toFixed(2)}`;
}

function addToCart(button) {
    const itemInfo = button.closest('.item-info');
    const title = itemInfo.querySelector('h3').textContent;
    const price = parseFloat(itemInfo.querySelector('.price').textContent.replace('R$ ', '').replace(',', '.'));
    const complementos = Array.from(itemInfo.querySelectorAll('.complemento.selected')).map(c => c.textContent);

    const cartItem = { title, price, complementos };
    cart.push(cartItem);
    updateCartUI();
    openCart();
}

function updateCartUI() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartCount = document.getElementById('cart-count');

    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
        <div class="empty-cart">
            <i class="fas fa-shopping-cart" style="font-size: 48px; margin-bottom: 16px;"></i>
            <p>Sua sacola está vazia</p>
        </div>`;
        cartTotal.textContent = 'R$ 0,00';
        cartCount.textContent = '0';
        return;
    }

    let total = 0;
    cart.forEach((item, index) => {
        total += item.price;

        const itemDiv = document.createElement('div');
        itemDiv.classList.add('cart-item');

        // Cabeçalho do item
        const headerDiv = document.createElement('div');
        headerDiv.classList.add('cart-item-header');
        headerDiv.innerHTML = `
            <strong>${item.title}</strong>
            <span class="cart-item-price">R$ ${item.price.toFixed(2)}</span>
        `;

        // Botão para remover o item inteiro (apenas se não tiver complementos)
        if (item.complementos.length === 0) {
            const removeBtn = document.createElement('button');
            removeBtn.classList.add('remove-btn');
            removeBtn.innerHTML = '<i class="fas fa-trash"></i>';
            removeBtn.onclick = () => removeItem(index);
            headerDiv.appendChild(removeBtn);
        }

        // Lista de complementos com botão para remover
        const compDiv = document.createElement('div');
        compDiv.classList.add('complementos-list');
        item.complementos.forEach((comp, compIndex) => {
            const compTag = document.createElement('div');
            compTag.classList.add('complemento-tag');
            compTag.innerHTML = `
                ${comp} <button onclick="removeComplemento(${index}, ${compIndex})">&times;</button>
            `;
            compDiv.appendChild(compTag);
        });

        itemDiv.appendChild(headerDiv);
        if (item.complementos.length > 0) itemDiv.appendChild(compDiv);

        cartItemsContainer.appendChild(itemDiv);
    });

    cartTotal.textContent = `R$ ${total.toFixed(2)}`;
    cartCount.textContent = cart.length;
}

function removeComplemento(itemIndex, compIndex) {
    cart[itemIndex].complementos.splice(compIndex, 1);
    cart[itemIndex].price -= 2;
    if (cart[itemIndex].price < 0) cart[itemIndex].price = 0;
    updateCartUI();
}

function removeItem(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function clearCart() {
    cart = [];
    updateCartUI();
}

function openCart() {
    document.getElementById('cart-sidebar').classList.add('active');
    document.getElementById('overlay').classList.add('active');
}

function toggleCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('overlay');
    cartSidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

function toggleDelivery() {
    const deliveryType = document.querySelector('input[name="delivery"]:checked').value;
    const deliveryAddress = document.getElementById('delivery-address');
    const pickupAddress = document.getElementById('pickup-address');

    if (deliveryType === 'Entrega') {
        deliveryAddress.classList.remove('hidden');
        pickupAddress.classList.add('hidden');
    } else {
        deliveryAddress.classList.add('hidden');
        pickupAddress.classList.remove('hidden');
    }
}

// Finalizar pedido
document.querySelector('.checkout-btn').addEventListener('click', () => {
    if (cart.length === 0) return alert('Sua sacola está vazia!');

    let message = 'Olá, quero fazer o pedido:\n';
    cart.forEach(item => {
        message += `- ${item.title}`;
        if (item.complementos.length > 0) message += ` (${item.complementos.join(', ')})`;
        message += ` - R$ ${item.price.toFixed(2)}\n`;
    });
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    message += `Total: R$ ${total.toFixed(2)}\n`;

    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    message += `Forma de pagamento: ${paymentMethod}\n`;

    const deliveryType = document.querySelector('input[name="delivery"]:checked').value;
    if (deliveryType === 'Entrega') {
        const address = document.getElementById('address-input').value.trim();
        if (!address) return alert('Por favor, digite o endereço para entrega!');
        message += `Entrega no endereço: ${address}`;
    } else {
        message += `Retirada na loja: Rua Cascais 385`;
    }

    const phone = '5567996776203';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
});
