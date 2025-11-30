// Menu Items Data
const menuItems = [
    {
        id: 1,
        name: 'VUT Special Burger',
        description: 'Juicy beef patty with fresh vegetables and special sauce',
        price: 45.00,
        image: 'images/burger joint.webp'
    },
    {
        id: 2,
        name: 'Varsity Pizza',
        description: 'Cheesy pizza with pepperoni, mushrooms, and bell peppers',
        price: 75.00,
        image: 'images/pizza palace.webp'
    },
    {
        id: 3,
        name: 'Crispy Chicken Wings',
        description: 'Spicy or BBQ flavored wings served with a dipping sauce',
        price: 55.00,
        image: 'images/wings.webp'
    },
    {
        id: 4,
        name: 'Coffee',
        description: 'Black and Creamy coffee',
        price: 15.00,
        image: 'images/coffee.webp'
    },
    {
        id: 5,
        name: 'Varsity Kota',
        description: 'Kota with chips, polony, cheese, special, sausages, burger patty, and bacon',
        price: 42.00,
        image: 'images/kota.jpg'
    },
    {
        id: 6,
        name: 'Milkshake and Ice cream',
        description: 'Vanilla, strawberry, chocolate flavoured milkshakes and ice cream',
        price: 15.00,
        image: 'images/milkshake.jpg'
    }
];

// State
let cart = [];
let user = null;
let orders = [];
let currentView = 'home';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    renderMenuItems();
    createParticles();
    updateUI();
    startOrderSimulation();
    
    // Add scroll effect to header
    window.addEventListener('scroll', () => {
        const header = document.getElementById('header');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Close dialogs when clicking outside
    document.addEventListener('click', (e) => {
        const userMenu = document.getElementById('userMenu');
        const userBtn = document.querySelector('.user-btn');
        if (!userMenu.contains(e.target) && !userBtn?.contains(e.target)) {
            userMenu?.classList.remove('active');
        }
    });
});

// Local Storage
function saveToStorage() {
    localStorage.setItem('vutEatsCart', JSON.stringify(cart));
    localStorage.setItem('vutEatsUser', JSON.stringify(user));
    localStorage.setItem('vutEatsOrders', JSON.stringify(orders));
}

function loadFromStorage() {
    const savedCart = localStorage.getItem('vutEatsCart');
    const savedUser = localStorage.getItem('vutEatsUser');
    const savedOrders = localStorage.getItem('vutEatsOrders');
    
    if (savedCart) cart = JSON.parse(savedCart);
    if (savedUser) user = JSON.parse(savedUser);
    if (savedOrders) orders = JSON.parse(savedOrders);
}

// View Management
function showView(view) {
    currentView = view;
    
    // Hide all views
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    
    // Show selected view
    const viewElement = document.getElementById(view + 'View');
    if (viewElement) viewElement.classList.add('active');
    
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.dataset.view === view) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Render specific views
    if (view === 'orders') {
        renderOrders();
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollToMenu() {
    const menu = document.getElementById('popular-items');
    if (menu) {
        menu.scrollIntoView({ behavior: 'smooth' });
    }
}

// Mobile Menu
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    const icon = document.getElementById('mobileMenuIcon');
    menu.classList.toggle('active');
    
    if (menu.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
}

// Menu Items
function renderMenuItems() {
    const grid = document.getElementById('itemsGrid');
    grid.innerHTML = menuItems.map(item => `
        <div class="item-card" data-id="${item.id}">
            <div class="item-image-container">
                <img src="${item.image}" alt="${item.name}" class="item-image">
                <div class="item-price-badge">R${item.price.toFixed(2)}</div>
            </div>
            <div class="item-content">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <button class="add-to-cart-btn" onclick="addToCart(${item.id})">
                    <i class="fas fa-shopping-cart"></i>
                    Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

function filterItems() {
    const query = document.getElementById('searchBar').value.toLowerCase();
    const filtered = menuItems.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query)
    );
    
    const grid = document.getElementById('itemsGrid');
    const noResults = document.getElementById('noResults');
    
    if (filtered.length === 0) {
        grid.style.display = 'none';
        noResults.style.display = 'block';
    } else {
        grid.style.display = 'grid';
        noResults.style.display = 'none';
        grid.innerHTML = filtered.map(item => `
            <div class="item-card" data-id="${item.id}">
                <div class="item-image-container">
                    <img src="${item.image}" alt="${item.name}" class="item-image">
                    <div class="item-price-badge">R${item.price.toFixed(2)}</div>
                </div>
                <div class="item-content">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <button class="add-to-cart-btn" onclick="addToCart(${item.id})">
                        <i class="fas fa-shopping-cart"></i>
                        Add to Cart
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// Cart Management
function addToCart(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;
    
    const existingItem = cart.find(i => i.id === itemId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...item, quantity: 1 });
    }
    
    saveToStorage();
    updateUI();
    showToast('success', `${item.name} added to cart!`, `R${item.price.toFixed(2)}`);
}

function updateCartQuantity(itemId, change) {
    const item = cart.find(i => i.id === itemId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(itemId);
    } else {
        saveToStorage();
        updateUI();
    }
}

function removeFromCart(itemId) {
    cart = cart.filter(i => i.id !== itemId);
    saveToStorage();
    updateUI();
    showToast('info', 'Item removed from cart');
}

function getTotalItems() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function getTotalPrice() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    
    renderCart();
}

function renderCart() {
    const content = document.getElementById('cartContent');
    
    if (cart.length === 0) {
        content.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
                <button class="checkout-btn" onclick="toggleCart()">Start Shopping</button>
            </div>
        `;
        return;
    }
    
    const subtotal = getTotalPrice();
    
    content.innerHTML = `
        ${cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">R${item.price.toFixed(2)}</div>
                    <div class="cart-item-actions">
                        <button class="qty-btn" onclick="updateCartQuantity(${item.id}, -1)">-</button>
                        <span class="cart-item-qty">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateCartQuantity(${item.id}, 1)">+</button>
                        <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
                    </div>
                </div>
            </div>
        `).join('')}
        <div class="cart-totals">
            <div class="total-row">
                <span>Subtotal:</span>
                <span class="highlight">R${subtotal.toFixed(2)}</span>
            </div>
            <button class="checkout-btn" onclick="openCheckout()">Proceed to Checkout</button>
        </div>
    `;
}

// Authentication
function showAuthDialog() {
    const dialog = document.getElementById('authDialog');
    const overlay = document.getElementById('authOverlay');
    dialog.classList.add('active');
    overlay.classList.add('active');
}

function closeAuthDialog() {
    const dialog = document.getElementById('authDialog');
    const overlay = document.getElementById('authOverlay');
    dialog.classList.remove('active');
    overlay.classList.remove('active');
}

function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.dataset.tab === tab) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    document.getElementById(tab + 'Tab').classList.add('active');
}

function signIn(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    user = {
        name: 'VUT Student',
        email: formData.get('email'),
        phone: '+27 73 623 5027'
    };
    
    saveToStorage();
    updateUI();
    closeAuthDialog();
    showToast('success', 'Welcome back!', 'You have successfully signed in.');
}

function signUp(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    user = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone')
    };
    
    saveToStorage();
    updateUI();
    closeAuthDialog();
    showToast('success', 'Account created!', 'Welcome to VUTeats!');
}

function signOut() {
    user = null;
    orders = [];
    cart = [];
    saveToStorage();
    updateUI();
    showToast('info', 'Signed out successfully');
}

function toggleUserMenu() {
    const menu = document.getElementById('userMenu');
    menu.classList.toggle('active');
}

// Checkout
function openCheckout() {
    if (!user) {
        showToast('error', 'Please sign in to checkout');
        toggleCart();
        showAuthDialog();
        return;
    }
    
    toggleCart();
    
    const dialog = document.getElementById('checkoutDialog');
    const overlay = document.getElementById('checkoutOverlay');
    dialog.classList.add('active');
    overlay.classList.add('active');
    
    renderCheckout();
    updateDeliveryFee();
}

function closeCheckoutDialog() {
    const dialog = document.getElementById('checkoutDialog');
    const overlay = document.getElementById('checkoutOverlay');
    dialog.classList.remove('active');
    overlay.classList.remove('active');
}

function renderCheckout() {
    const itemsContainer = document.getElementById('checkoutItems');
    const subtotal = getTotalPrice();
    
    itemsContainer.innerHTML = cart.map(item => `
        <div class="checkout-item">
            <span class="checkout-item-name">${item.name} x${item.quantity}</span>
            <span class="checkout-item-price">R${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');
    
    document.getElementById('checkoutSubtotal').textContent = `R${subtotal.toFixed(2)}`;
}

function updateDeliveryFee() {
    const deliveryMethod = document.querySelector('input[name="deliveryMethod"]:checked').value;
    const locationSection = document.getElementById('locationSection');
    const deliveryLocation = document.getElementById('deliveryLocation');
    
    const deliveryFee = deliveryMethod === 'delivery' ? 15 : 0;
    const subtotal = getTotalPrice();
    const total = subtotal + deliveryFee;
    
    document.getElementById('checkoutDeliveryFee').textContent = 
        deliveryFee === 0 ? 'FREE' : `R${deliveryFee.toFixed(2)}`;
    document.getElementById('checkoutTotal').textContent = `R${total.toFixed(2)}`;
    document.getElementById('checkoutBtnText').textContent = `Place Order - R${total.toFixed(2)}`;
    
    if (deliveryMethod === 'delivery') {
        locationSection.style.display = 'block';
        deliveryLocation.required = true;
    } else {
        locationSection.style.display = 'none';
        deliveryLocation.required = false;
    }
}

function placeOrder(e) {
    e.preventDefault();
    
    if (!user) {
        showToast('error', 'Please sign in to place an order');
        return;
    }
    
    const formData = new FormData(e.target);
    const deliveryMethod = formData.get('deliveryMethod');
    const deliveryFee = deliveryMethod === 'delivery' ? 15 : 0;
    const total = getTotalPrice() + deliveryFee;
    
    const order = {
        id: `ORD-${Date.now()}`,
        items: [...cart],
        total: total,
        deliveryMethod: deliveryMethod,
        paymentMethod: formData.get('paymentMethod'),
        location: deliveryMethod === 'delivery' ? formData.get('location') : 'VUT Cafeteria',
        instructions: formData.get('instructions') || '',
        status: 'preparing',
        timestamp: new Date().toISOString(),
        estimatedTime: deliveryMethod === 'delivery' ? '25-30 minutes' : '10-15 minutes',
        user: { ...user }
    };
    
    orders.unshift(order);
    cart = [];
    
    saveToStorage();
    updateUI();
    closeCheckoutDialog();
    
    showToast('success', 'Order placed successfully!', `Your order will be ready in ${order.estimatedTime}`);
    
    setTimeout(() => {
        showView('orders');
    }, 1000);
}

// Orders
function renderOrders() {
    const container = document.getElementById('ordersContainer');
    
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-cart" style="padding: 60px 20px;">
                <i class="fas fa-box"></i>
                <p>No orders yet</p>
                <p style="font-size: 14px; color: #999; margin-top: 10px;">Start ordering to see your order history</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
            <h3 style="color: var(--vut-blue);">Your Orders</h3>
            <button class="clear-history-btn" onclick="clearOrderHistory()">Clear History</button>
        </div>
        ${orders.map(order => renderOrderCard(order)).join('')}
    `;
}

function renderOrderCard(order) {
    const statusClass = `status-${order.status.replace(/-/g, '-')}`;
    const progress = getOrderProgress(order.status);
    
    return `
        <div class="order-card">
            <div class="order-header">
                <div>
                    <h4 class="order-title">
                        <i class="fas fa-${getStatusIcon(order.status)}"></i>
                        Order ${order.id}
                    </h4>
                    <p class="order-date">${new Date(order.timestamp).toLocaleString()}</p>
                </div>
                <span class="status-badge ${statusClass}">${getStatusText(order.status)}</span>
            </div>
            
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            
            <div class="order-details">
                <div class="order-detail">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${order.deliveryMethod === 'delivery' ? `Delivery to ${order.location}` : 'Pickup at VUT Cafeteria'}</span>
                </div>
                <div class="order-detail">
                    <i class="fas fa-clock"></i>
                    <span>Estimated: ${order.estimatedTime}</span>
                </div>
            </div>
            
            <div class="order-items">
                <p class="order-items-label">Items:</p>
                ${order.items.map(item => `
                    <div class="order-item">
                        <span class="order-item-name">${item.name} x${item.quantity}</span>
                        <span class="order-item-price">R${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
                <div class="order-item" style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee;">
                    <span style="color: var(--vut-blue); font-weight: 600;">Total</span>
                    <span style="color: var(--vut-yellow); font-weight: 600;">R${order.total.toFixed(2)}</span>
                </div>
            </div>
            
            <div class="order-timeline">
                ${renderTimeline(order.status)}
            </div>
        </div>
    `;
}

function renderTimeline(status) {
    const steps = ['preparing', 'ready', 'on-the-way', 'delivered'];
    const currentIndex = steps.indexOf(status);
    
    return steps.map((step, index) => {
        const isActive = index <= currentIndex;
        return `
            <div class="timeline-step ${isActive ? 'active' : ''}">
                <div class="timeline-icon">
                    ${isActive ? '<i class="fas fa-check-circle"></i>' : ''}
                </div>
                <p class="timeline-label">${getStepLabel(step)}</p>
            </div>
        `;
    }).join('');
}

function getStepLabel(step) {
    const labels = {
        'preparing': 'Preparing',
        'ready': 'Ready',
        'on-the-way': 'On Way',
        'delivered': 'Done'
    };
    return labels[step] || step;
}

function getOrderProgress(status) {
    const progress = {
        'preparing': 25,
        'ready': 50,
        'on-the-way': 75,
        'delivered': 100
    };
    return progress[status] || 0;
}

function getStatusIcon(status) {
    const icons = {
        'preparing': 'box',
        'ready': 'check-circle',
        'on-the-way': 'truck',
        'delivered': 'check-circle'
    };
    return icons[status] || 'box';
}

function getStatusText(status) {
    const texts = {
        'preparing': 'Preparing',
        'ready': 'Ready',
        'on-the-way': 'On the Way',
        'delivered': 'Delivered'
    };
    return texts[status] || status;
}

function clearOrderHistory() {
    if (confirm('Are you sure you want to clear your order history?')) {
        orders = [];
        saveToStorage();
        updateUI();
        showToast('info', 'Order history cleared');
    }
}

// Order Simulation
function startOrderSimulation() {
    setInterval(() => {
        let updated = false;
        orders = orders.map(order => {
            if (order.status === 'preparing') {
                updated = true;
                return { ...order, status: 'ready' };
            } else if (order.status === 'ready' && order.deliveryMethod === 'delivery') {
                updated = true;
                return { ...order, status: 'on-the-way' };
            } else if (order.status === 'on-the-way') {
                updated = true;
                return { ...order, status: 'delivered' };
            }
            return order;
        });
        
        if (updated) {
            saveToStorage();
            if (currentView === 'orders') {
                renderOrders();
            }
        }
    }, 10000); // Update every 10 seconds
}

// Contact Form
function sendMessage(e) {
    e.preventDefault();
    showToast('success', 'Message sent!', "We'll get back to you soon.");
    e.target.reset();
}

// UI Updates
function updateUI() {
    const totalItems = getTotalItems();
    
    // Update cart badges
    document.getElementById('cartBadge').textContent = totalItems;
    document.getElementById('mobileCartCount').textContent = totalItems;
    
    // Update order badges
    const orderCount = orders.length;
    const orderBadge = document.getElementById('orderBadge');
    const orderCountElements = document.querySelectorAll('.order-count');
    
    if (orderCount > 0) {
        orderBadge.style.display = 'inline-block';
        orderBadge.textContent = orderCount;
        orderCountElements.forEach(el => {
            el.textContent = orderCount;
        });
    } else {
        orderBadge.style.display = 'none';
    }
    
    // Update auth section
    const authBtn = document.getElementById('authBtn');
    const userDropdown = document.getElementById('userDropdown');
    const mobileAuthBtn = document.getElementById('mobileAuthBtn');
    
    if (user) {
        authBtn.style.display = 'none';
        userDropdown.style.display = 'block';
        document.getElementById('userName').textContent = user.name.split(' ')[0];
        document.getElementById('userNameText').textContent = user.name;
        document.getElementById('userEmail').textContent = user.email;
        mobileAuthBtn.textContent = 'Sign Out';
        mobileAuthBtn.onclick = signOut;
    } else {
        authBtn.style.display = 'block';
        userDropdown.style.display = 'none';
        mobileAuthBtn.textContent = 'Sign In';
        mobileAuthBtn.onclick = showAuthDialog;
    }
}

// Toast Notifications
function showToast(type, title, description = '') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        info: 'fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            ${description ? `<div class="toast-desc">${description}</div>` : ''}
        </div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Particles
function createParticles() {
    // Hero particles
    const heroParticles = document.getElementById('heroParticles');
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 2 + 's';
        heroParticles.appendChild(particle);
    }
    
    // Footer particles
    const footerParticles = document.getElementById('footerParticles');
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 3 + 's';
        footerParticles.appendChild(particle);
    }
}