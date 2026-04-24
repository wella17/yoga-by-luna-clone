// Shopping Cart Functionality

class ShoppingCart {
    constructor() {
        this.items = this.loadCart();
        this.init();
    }

    init() {
        this.updateCartDisplay();
        this.updateCartCount();
        this.bindEvents();
        this.initPaymentOptions();
    }

    // Load cart from localStorage
    loadCart() {
        const saved = localStorage.getItem('yogaCart');
        return saved ? JSON.parse(saved) : [];
    }

    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('yogaCart', JSON.stringify(this.items));
    }

    // Add item to cart
    addItem(item) {
        const existingItem = this.items.find(cartItem => cartItem.id === item.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                ...item,
                quantity: 1
            });
        }

        this.saveCart();
        this.updateCartDisplay();
        this.updateCartCount();
        this.showAddedNotification(item.title);
    }

    // Remove item from cart
    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.saveCart();
        this.updateCartDisplay();
        this.updateCartCount();
    }

    // Update item quantity
    updateQuantity(itemId, newQuantity) {
        const item = this.items.find(cartItem => cartItem.id === itemId);

        if (item) {
            if (newQuantity <= 0) {
                this.removeItem(itemId);
            } else {
                item.quantity = newQuantity;
                this.saveCart();
                this.updateCartDisplay();
                this.updateCartCount();
            }
        }
    }

    // Calculate totals
    calculateTotals() {
        const subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const processingFee = subtotal > 0 ? Math.max(subtotal * 0.03, 2.99) : 0;
        const total = subtotal + processingFee;

        return {
            subtotal: subtotal.toFixed(2),
            processingFee: processingFee.toFixed(2),
            total: total.toFixed(2)
        };
    }

    // Update cart display
    updateCartDisplay() {
        const cartItemsContainer = document.getElementById('cart-items');
        const cartEmptyContainer = document.getElementById('cart-empty');
        const cartSummary = document.getElementById('cart-summary');

        if (!cartItemsContainer) return;

        if (this.items.length === 0) {
            cartItemsContainer.style.display = 'none';
            cartEmptyContainer.style.display = 'block';
            cartSummary.style.display = 'none';
            return;
        }

        cartItemsContainer.style.display = 'block';
        cartEmptyContainer.style.display = 'none';
        cartSummary.style.display = 'block';

        cartItemsContainer.innerHTML = this.items.map(item => this.renderCartItem(item)).join('');

        // Update summary
        const totals = this.calculateTotals();
        document.getElementById('subtotal').textContent = `$${totals.subtotal}`;
        document.getElementById('processing-fee').textContent = `$${totals.processingFee}`;
        document.getElementById('total').textContent = `$${totals.total}`;

        // Update payment amounts
        document.getElementById('zelle-amount').textContent = `$${totals.total}`;
        document.getElementById('venmo-amount').textContent = `$${totals.total}`;

        // Enable checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.disabled = false;
        }
    }

    // Render individual cart item
    renderCartItem(item) {
        const itemIcon = this.getItemIcon(item.id);

        return `
            <div class="cart-item" data-item-id="${item.id}">
                <div class="item-image">${itemIcon}</div>
                <div class="item-details">
                    <h4 class="item-title">${item.title}</h4>
                    <p class="item-description">${item.description}</p>
                    <div class="item-duration">${item.duration}</div>
                </div>
                <div class="item-controls">
                    <div class="quantity-control">
                        <button class="quantity-btn" onclick="cart.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" onclick="cart.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                    </div>
                    <div class="item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                    <button class="remove-item" onclick="cart.removeItem('${item.id}')" title="Remove item">🗑️</button>
                </div>
            </div>
        `;
    }

    // Get icon for item type
    getItemIcon(itemId) {
        const icons = {
            'coaching': '🧘‍♀️',
            'astro-yoga': '🌙',
            'meditation': '🧘‍♂️',
            'retreat': '🌿'
        };
        return icons[itemId] || '🕉️';
    }

    // Update cart count in header
    updateCartCount() {
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
    }

    // Show notification when item added
    showAddedNotification(itemTitle) {
        // Simple notification - could be enhanced with a toast library
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #df9d00;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 10000;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        notification.innerHTML = `✅ Added "${itemTitle}" to cart`;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Bind event listeners
    bindEvents() {
        // Payment method selection
        const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
        paymentMethods.forEach(method => {
            method.addEventListener('change', () => this.handlePaymentMethodChange());
        });

        // Checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.proceedToCheckout());
        }

        // Payment forms
        this.bindPaymentForms();
    }

    // Initialize payment options
    initPaymentOptions() {
        const paymentMethods = document.querySelectorAll('.payment-method');
        paymentMethods.forEach(method => {
            method.addEventListener('click', () => {
                const radio = method.querySelector('input[type="radio"]');
                if (radio) {
                    radio.checked = true;
                    this.handlePaymentMethodChange();
                }
            });
        });
    }

    // Handle payment method change
    handlePaymentMethodChange() {
        const selectedMethod = document.querySelector('input[name="payment-method"]:checked').value;

        // Update visual selection
        document.querySelectorAll('.payment-method').forEach(method => {
            method.classList.remove('selected');
        });

        document.querySelector(`input[value="${selectedMethod}"]`).closest('.payment-method').classList.add('selected');

        // Show appropriate payment form
        this.showPaymentForm(selectedMethod);
    }

    // Show payment form based on selected method
    showPaymentForm(method) {
        const formsContainer = document.getElementById('payment-forms');
        const allForms = formsContainer.querySelectorAll('.payment-form');

        // Hide all forms
        allForms.forEach(form => form.style.display = 'none');

        // Show selected form
        const targetForm = document.getElementById(`${method}-form`);
        if (targetForm) {
            targetForm.style.display = 'block';
        }
    }

    // Proceed to checkout
    proceedToCheckout() {
        if (this.items.length === 0) return;

        const selectedMethod = document.querySelector('input[name="payment-method"]:checked').value;
        const formsContainer = document.getElementById('payment-forms');

        formsContainer.style.display = 'block';
        formsContainer.scrollIntoView({ behavior: 'smooth' });

        this.showPaymentForm(selectedMethod);
    }

    // Bind payment form events
    bindPaymentForms() {
        // Card form
        const cardForm = document.getElementById('card-form');
        if (cardForm) {
            cardForm.addEventListener('submit', (e) => this.handleCardPayment(e));
            this.initCardInputs();
        }

        // Zelle form
        const zelleForm = document.getElementById('zelle-confirm-form');
        if (zelleForm) {
            zelleForm.addEventListener('submit', (e) => this.handleZelleConfirmation(e));
        }

        // Venmo form
        const venmoForm = document.getElementById('venmo-confirm-form');
        if (venmoForm) {
            venmoForm.addEventListener('submit', (e) => this.handleVenmoConfirmation(e));
        }
    }

    // Initialize card input formatting
    initCardInputs() {
        const cardNumber = document.getElementById('card-number');
        const cardExpiry = document.getElementById('card-expiry');
        const cardCvc = document.getElementById('card-cvc');

        if (cardNumber) {
            cardNumber.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\s/g, '');
                value = value.replace(/(.{4})/g, '$1 ').trim();
                e.target.value = value;
            });
        }

        if (cardExpiry) {
            cardExpiry.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                }
                e.target.value = value;
            });
        }

        if (cardCvc) {
            cardCvc.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '');
            });
        }
    }

    // Handle card payment
    handleCardPayment(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const paymentData = {
            customerName: formData.get('customer-name'),
            customerEmail: formData.get('customer-email'),
            amount: this.calculateTotals().total,
            items: this.items
        };

        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Processing...';
        submitBtn.disabled = true;

        // Simulate payment processing
        setTimeout(() => {
            this.completeOrder(paymentData, 'Credit Card');
        }, 2000);
    }

    // Handle Zelle confirmation
    handleZelleConfirmation(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const confirmData = {
            customerName: formData.get('zelle-name'),
            customerEmail: formData.get('zelle-email'),
            customerPhone: formData.get('zelle-phone'),
            amount: this.calculateTotals().total,
            items: this.items
        };

        this.completeOrder(confirmData, 'Zelle');
    }

    // Handle Venmo confirmation
    handleVenmoConfirmation(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const confirmData = {
            customerName: formData.get('venmo-name'),
            customerEmail: formData.get('venmo-email'),
            venmoUsername: formData.get('venmo-username'),
            amount: this.calculateTotals().total,
            items: this.items
        };

        this.completeOrder(confirmData, 'Venmo');
    }

    // Complete order
    completeOrder(paymentData, paymentMethod) {
        // Generate order ID
        const orderId = 'YBL-' + Date.now();

        // Save order details (in a real app, this would go to a server)
        const orderDetails = {
            orderId,
            paymentMethod,
            paymentData,
            items: this.items,
            totals: this.calculateTotals(),
            timestamp: new Date().toISOString()
        };

        // Log order for demo purposes (in production, send to server)
        console.log('Order completed:', orderDetails);

        // Show success message
        this.showSuccessMessage(orderId);

        // Clear cart
        this.items = [];
        this.saveCart();
        this.updateCartCount();

        // Send confirmation email simulation
        this.sendConfirmationEmail(orderDetails);
    }

    // Show success message
    showSuccessMessage(orderId) {
        // Hide payment forms
        document.getElementById('payment-forms').style.display = 'none';

        // Hide cart content
        document.querySelector('.cart-container').style.display = 'none';

        // Show success message
        const successMessage = document.getElementById('success-message');
        const orderIdElement = document.getElementById('order-id');

        orderIdElement.textContent = orderId;
        successMessage.style.display = 'block';
        successMessage.scrollIntoView({ behavior: 'smooth' });
    }

    // Simulate sending confirmation email
    sendConfirmationEmail(orderDetails) {
        // In a real application, this would trigger a server endpoint
        console.log('Sending confirmation email to:', orderDetails.paymentData.customerEmail);

        // For demo purposes, show in console
        console.log('Confirmation email content:', {
            to: orderDetails.paymentData.customerEmail,
            subject: `Order Confirmation - ${orderDetails.orderId}`,
            body: `Thank you for your purchase! Luna will contact you within 24 hours to schedule your sessions.`
        });
    }

    // Clear cart (for testing)
    clearCart() {
        this.items = [];
        this.saveCart();
        this.updateCartDisplay();
        this.updateCartCount();
    }
}

// Predefined yoga programs
const YOGA_PROGRAMS = {
    'coaching': {
        id: 'coaching',
        title: '1:1 Yoga Coaching',
        description: 'Personalized instruction tailored to your individual needs, goals, and spiritual journey.',
        price: 1444,
        duration: '6 Months, all programs included'
    },
    'astro-yoga': {
        id: 'astro-yoga',
        title: 'Astro-yoga Class',
        description: 'Align your yoga practice with cosmic energies and lunar cycles.',
        price: 75,
        duration: 'Monthly membership'
    },
    'meditation': {
        id: 'meditation',
        title: 'Personal Guided Meditations',
        description: 'Customized meditation sessions designed to meet your specific needs.',
        price: 20,
        duration: 'Monthly membership'
    },
    'retreat': {
        id: 'retreat',
        title: 'Amazon Retreat',
        description: 'Transform your practice in the heart of the Amazon rainforest.',
        price: 2500,
        duration: 'Multi-day immersive experience'
    }
};

// Initialize cart when DOM is loaded
let cart;

document.addEventListener('DOMContentLoaded', function() {
    cart = new ShoppingCart();

    // Add "Add to Cart" buttons to existing classes
    addCartButtonsToClasses();
});

// Add cart buttons to classes page
function addCartButtonsToClasses() {
    const classItems = document.querySelectorAll('.class-item');

    classItems.forEach((item, index) => {
        const programKeys = Object.keys(YOGA_PROGRAMS);
        const programKey = programKeys[index] || 'coaching';
        const program = YOGA_PROGRAMS[programKey];

        if (program) {
            const button = document.createElement('button');
            button.className = 'add-to-cart-btn';
            button.textContent = 'Add to Cart';
            button.addEventListener('click', () => cart.addItem(program));

            item.appendChild(button);
        }
    });
}

// Global functions for easy testing
window.cartDebug = {
    addCoaching: () => cart.addItem(YOGA_PROGRAMS.coaching),
    addAstroYoga: () => cart.addItem(YOGA_PROGRAMS['astro-yoga']),
    addMeditation: () => cart.addItem(YOGA_PROGRAMS.meditation),
    addRetreat: () => cart.addItem(YOGA_PROGRAMS.retreat),
    clearCart: () => cart.clearCart(),
    getCart: () => cart.items
};