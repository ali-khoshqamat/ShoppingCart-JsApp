// selectors:
const cartBtn = document.querySelector(".cart-btn");
const cartModal = document.querySelector(".cart");
const backDrop = document.querySelector(".back-drop");
const confirmCartBtn = document.querySelector(".cart-item-confirm");

const productsDOM = document.querySelector(".products-center");
const cartContent = document.querySelector(".cart-content");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const clearCart = document.querySelector(".clear-cart");

import { productsData } from "./products.js";
let cart = [];
let btnsDOM = [];

// ! Class Programming
// 1. get products
class Products {
  getProducts() {
    return productsData;
  }
}

// 2. display products
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach((product) => {
      result += `<div class="product">
        <div class="img-container">
          <img src=${product.imageUrl} alt="" class="product-img" />
        </div>
        <div class="product-desc">
          <p class="product-price">$ ${product.price}</p>
          <p class="product-title">${product.title}</p>
        </div>
        <button class="btn add-to-cart" data-id=${product.id}>
          <i class="fas fa-cart-plus"></i>
          Add to Cart
        </button>
      </div>`;
      productsDOM.innerHTML = result;
    });
  }
  addCartItem(cart) {
    let result = "";
    cart.forEach((product) => {
      result += `<div class="cart-item">
        <img src=${product.imageUrl} alt="" class="cart-item-img" />
        <div class="cart-item-desc">
          <h4>${product.title}</h4>
          <h5>$ ${product.price}</h5>
        </div>
        <div class="cart-item-controller">
          <i class="fa-solid fa-chevron-up" data-id=${product.id}></i>
          <p>${product.quantity}</p>
          <i class="fa-solid fa-chevron-down" data-id=${product.id}></i>
        </div>
        <i class="fa-solid fa-trash" data-id=${product.id}></i>
      </div>`;
      cartContent.innerHTML = result;
    });
  }
  getAddToCartBtns() {
    const addToCartBtns = [...document.querySelectorAll(".add-to-cart")];
    btnsDOM = addToCartBtns;
    addToCartBtns.forEach((btn) => {
      const id = btn.dataset.id;
      // check if this product id is in cart or not?
      const lsCart = Storage.getCart();
      const isInCart = lsCart.find((p) => p.id === parseInt(id));
      if (isInCart) {
        btn.innerText = "In Cart";
        btn.disabled = true;
      }
      btn.addEventListener("click", (e) => {
        e.target.innerText = "In Cart";
        e.target.disabled = true;
        // get product from products:
        const addedProduct = { ...Storage.getProduct(id), quantity: 1 };
        // add to cart
        cart = [...cart, addedProduct];
        // save cart to local storage
        Storage.saveCart(cart);
        // update cart value
        this.setCartValue(cart);
        // add to cart item
        this.addCartItem(cart);
      });
    });
  }
  setCartValue(cart) {
    // 1. cart items
    // 2. cart total price
    let tempCartItems = 0;
    const totalPrice = cart.reduce((acc, curr) => {
      tempCartItems += curr.quantity;
      return acc + curr.quantity * curr.price;
    }, 0);
    cartTotal.innerText = `total price: ${totalPrice.toFixed(2)} $`;
    cartItems.innerText = tempCartItems;
  }
  setupApp() {
    // set up: get cart and set up app
    cart = Storage.getCart();
    this.addCartItem(cart);
    // set value: total price + items
    this.setCartValue(cart);
  }
  cartLogic() {
    // clear cart:
    clearCart.addEventListener("click", () => this.clearCart());
    // cart functionality
    cartContent.addEventListener("click", (e) => this.cartItemController(e));
  }
  cartItemController(e) {
    if (e.target.classList.contains("fa-chevron-up")) {
      const addQuantity = e.target;
      // 1. get item from cart
      const addedItem = cart.find((c) => c.id == addQuantity.dataset.id);
      addedItem.quantity++;
      // 2. udate cart value
      this.setCartValue(cart);
      // 3. save cart
      Storage.saveCart(cart);
      // 4. update cart item in UI
      addQuantity.nextElementSibling.innerText = addedItem.quantity;
    } else if (e.target.classList.contains("fa-trash")) {
      const removeItem = e.target;
      const _removedItem = cart.find((c) => c.id == removeItem.dataset.id);
      this.removeItem(_removedItem.id);
      cartContent.removeChild(removeItem.parentElement);
    } else if (e.target.classList.contains("fa-chevron-down")) {
      const subQuantity = e.target;
      const substractedItem = cart.find((c) => c.id == subQuantity.dataset.id);
      substractedItem.quantity--;
      if (substractedItem.quantity === 0) {
        this.removeItem(substractedItem.id);
        cartContent.removeChild(subQuantity.parentElement.parentElement);
        return;
      }
      this.setCartValue(cart);
      Storage.saveCart(cart);
      subQuantity.previousElementSibling.innerText = substractedItem.quantity;
    }
  }
  clearCart() {
    // remove: (DRY) =>
    cart.forEach((cItem) => this.removeItem(cItem.id));
    // remove cart content children:
    while (cartContent.children.length) {
      cartContent.removeChild(cartContent.children[0]);
    }
    closeModalFunction();
  }
  removeItem(id) {
    // update cart
    cart = cart.filter((cItem) => cItem.id !== id);
    // total and cart items
    this.setCartValue(cart);
    // update storage
    Storage.saveCart(cart);
    // get add to cart btns => update text and disable
    this.getSingleBtn(id);
  }
  getSingleBtn(id) {
    const btn = btnsDOM.find((btn) => btn.dataset.id == id);
    btn.innerHTML = `<i class="fas fa-cart-plus"></i>
    Add to Cart`;
    btn.disabled = false;
  }
}

// 3. storage
class Storage {
  //! static method
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    const _products = JSON.parse(localStorage.getItem("products"));
    return _products.find((p) => p.id === parseInt(id));
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const products = new Products();
  const productsData = products.getProducts();
  const ui = new UI();
  ui.displayProducts(productsData);
  ui.getAddToCartBtns();
  ui.setupApp();
  ui.cartLogic();
  Storage.saveProducts(productsData); //! static method not needed to use new
});

// cart items modal
// event listeners:
cartBtn.addEventListener("click", showModalFunction);
confirmCartBtn.addEventListener("click", closeModalFunction);
backDrop.addEventListener("click", closeModalFunction);
// functions:
function showModalFunction() {
  backDrop.style.display = "block";
  cartModal.style.opacity = "1";
  cartModal.style.top = "20%";
}
function closeModalFunction() {
  backDrop.style.display = "none";
  cartModal.style.opacity = "0";
  cartModal.style.top = "-100%";
}

