const cartBtn = document.querySelector(".cart-btn");
const clearCartBtn = document.querySelector(".btn-clear");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".total-value");
const cartContent = document.querySelector(".cart-list");
const productsDom = document.querySelector("#products-dom");

let buttonsDom = [];
let card = [];

class Products {
    async getProducts() {
        try {
            let result = await fetch("https://64f2d1fdedfa0459f6c606e5.mockapi.io/products");
            let data = await result.json();
            let products = data;
            return products;
        }

        catch (error) {
            console.log(error);
        }
    }
}


class UI {
    displayProducts(products) {
        let result = "";
        products.forEach(item => {

            result += `  <div class="col-lg-4 col-md-6">
        <div class="product">
            <div class="product-image">
                <img src="${item.image}" alt="product">
            </div>
            <div class="product-hover">
                <span class="product-title">${item.title}</span>
                <span class="product-price">$${item.price}</span>
                <button class="btn-add-to-cart" data-id= ${item.id}>
                    <i class="fas fa-cart-shopping"></i>
                </button>
            </div>
        </div>
    </div>`

        });
        productsDom.innerHTML = result;
    }

    getBagButtons() {
        const buttons = [...document.querySelectorAll(".btn-add-to-cart")];
        buttonsDom = buttons;
        buttons.forEach((button) => {
            let id = button.dataset.id;
            let incard = card.find(item => item.id === id);
            if (incard) {
                button.setAttribute("disabled", "disabled");
                button.opacity = ".3";
            } else {
                button.addEventListener("click", event => {
                    event.target.disabled = true;
                    event.target.style.opacity = ".3";
                    // get product from products
                    let cardItem = { ...Storage.getProduct(id), amount: 1 }
                    // add product to the card
                    card = [...card, cardItem]
                    // save card in local storage
                    Storage.saveCard(card);
                    // save card values
                    this.saveCardValues(card);
                    // display card item
                    this.addCardItem(cardItem);
                    // show the card
                    this.showCard();
                })
            }
        })

    }

    saveCardValues(card) {
        let tempTotal = 0;
        let itemsTotal = 0;
        card.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }

    addCardItem(item) {
        const li = document.createElement("li");
        li.classList.add("cart-list-item");
        li.innerHTML = `<div class="cart-left">
        <div class="cart-left-image">
            <img src="${item.image}" alt="product" />
        </div>
        <div class="cart-left-info">
            <a class="cart-left-info-title" href="#">${item.title}</a>
            <span class="cart-left-info-price">$${item.price}</span>
        </div>
    </div>
    <div class="cart-right">
        <div class="cart-right-quantity">
            <button class="quantity-minus" data-id=${item.id}>
                <i class="fas fa-minus"></i>
            </button>
            <span class="quantity">${item.amount}</span>
            <button class="quantity-plus" data-id=${item.id}>
                <i class="fas fa-plus"></i>
            </button>
        </div>
        <div class="cart-right-remove">
            <button class="cart-remove-btn" data-id=${item.id}>
                <i class="fas fa-trash"></i>
            </button>
        </div>
    </div>`

        cartContent.appendChild(li);
    }

    showCard() {
        cartBtn.click();

    }

    setupApp() {
        card = Storage.getCard();
        this.saveCardValues(card);
        this.populateCard(card);
    }
    populateCard() {
        card.forEach(item => this.addCardItem(item));
    }

    cartLogic() {
        clearCartBtn.addEventListener("click", () => {
            this.clearCart();
        })

        cartContent.addEventListener("click", event => {
            if (event.target.classList.contains("cart-remove-btn")) {
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                removeItem.parentElement.parentElement.parentElement.remove();
                this.removeItem(id);
            } else if (event.target.classList.contains("quantity-minus")) {
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = card.find(item => item.id === id);
                tempItem.amount = tempItem.amount - 1;
                if (tempItem.amount > 0) {
                    Storage.saveCard(card);
                    this.saveCardValues(card);
                    lowerAmount.nextElementSibling.innerText = tempItem.amount;

                } else {
                    lowerAmount.parentElement.parentElement.parentElement.remove();
                    this.removeItem(id);
                }
            } else if (event.target.classList.contains("quantity-plus")) {
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = card.find(item => item.id === id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCard(card);
                this.saveCardValues(card);
                addAmount.previousElementSibling.innerText = tempItem.amount;


            }
        }
        )
    }

    clearCart() {
        let cardItems = card.map(item => item.id);
        cardItems.forEach(id => this.removeItem(id));
        while (cartContent.children.lenght > 0) {
            cartContent.removeChild(cartContent.children[0])
        }
    }

    removeItem(id) {
        card = card.filter(item => item.id !== id);
        this.saveCardValues(card);
        Storage.saveCard(card);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.style.opacity = "1";
    }

    getSingleButton(id) {
        return buttonsDom.find(button => button.dataset.id === id);

    }
}


class Storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));

    }
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem("products"))
        return products.find(product => product.id === id);

    }

    static saveCard(card) {
        localStorage.setItem("card", JSON.stringify(card));

    }

    static getCard() {
        return localStorage.getItem("card") ? JSON.parse(localStorage.getItem("card")) : []
    }

}

document.addEventListener("DOMContentLoaded", () => { 
    const ui = new UI();
    const products = new Products();
    ui.setupApp();
    products.getProducts().then(products => {
        ui.displayProducts(products);
        Storage.saveProducts(products);
    }).then(() => {
        ui.getBagButtons();
        ui.cartLogic();

    })

})
