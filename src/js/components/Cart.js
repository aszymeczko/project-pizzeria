import { select, classNames, templates, settings } from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart {
    constructor(element) {
        const thisCart = this;

        thisCart.products = [];

        thisCart.getElements(element);
        thisCart.initActions();

        // console.log('new Cart', thisCart);
    }

    getElements(element) {
        const thisCart = this;

        thisCart.dom = {};

        thisCart.dom.wrapper = element;

        thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);

        thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);

        thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);

        thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);

        thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);

        thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);

        thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);

        thisCart.dom.adress = thisCart.dom.wrapper.querySelector(select.cart.address);

        thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    }

    initActions() {
        const thisCart = this;

        thisCart.dom.toggleTrigger.addEventListener('click', function () {
            thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
        });

        thisCart.dom.productList.addEventListener('updated', function () {
            thisCart.update();
        });

        thisCart.dom.productList.addEventListener('remove', function () {
            thisCart.remove(event.detail.cartProduct);
        });

        thisCart.dom.form.addEventListener('submit', function (event) {
            event.preventDefault();
            thisCart.sendOrder();
        });
    }

    add(menuProduct) {
        const thisCart = this;

        // console.log('adding product', menuProduct);

        /* generate HTML based on template */
        const generatedHTML = templates.cartProduct(menuProduct);

        /* create element using utils.createElementFromHTML */
        const generatedDOM = utils.createDOMFromHTML(generatedHTML);

        /* add element to cart */
        thisCart.dom.productList.appendChild(generatedDOM);

        thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
        // console.log('thisCart.products', thisCart.products);

        thisCart.update();
    }

    update() {
        const thisCart = this;

        const deliveryFee = settings.cart.defaultDeliveryFee;

        let totalNumber = 0;

        let subtotalPrice = 0;

        for (let product of thisCart.products) {
            totalNumber += product.amount;
            subtotalPrice += product.price;
        }
        console.log('thisCart', thisCart)

        if (subtotalPrice) {
            thisCart.totalPrice = subtotalPrice + deliveryFee;

            thisCart.dom.deliveryFee.innerHTML = deliveryFee;

            thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;

            for (let element of thisCart.dom.totalPrice) {
                element.innerHTML = thisCart.totalPrice;
            }

            thisCart.dom.totalNumber.innerHTML = totalNumber;

            thisCart.subtotalPrice = subtotalPrice;
            thisCart.deliveryFee = deliveryFee;
            thisCart.totalNumber = totalNumber;
        }

        else {
            thisCart.totalPrice = 0;
            thisCart.subtotalPrice = 0;
            thisCart.deliveryFee = 0;
            thisCart.totalNumber = 0;
        }
    }

    remove(product) {
        const thisCart = this;

        product.dom.wrapper.remove();

        const productIndex = thisCart.products.indexOf(product);

        if (productIndex !== -1) {
            thisCart.products.splice(productIndex, 1);
        }

        thisCart.update();
    }

    sendOrder() {
        const thisCart = this;

        const url = settings.db.url + '/' + settings.db.orders;

        const payload = {
            address: thisCart.dom.adress.value,
            phone: thisCart.dom.phone.value,
            totalPrice: thisCart.totalPrice,
            subtotalPrice: thisCart.subtotalPrice,
            totalNumber: thisCart.totalNumber,
            deliveryFee: thisCart.deliveryFee,
            products: [],
        };
        console.log('payload', payload);

        for (let prod of thisCart.products) {
            payload.products.push(prod.getData());
        }

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        };

        fetch(url, options)
            .then(function (response) {
                return response.json();
            }).then(function (parsedResponse) {
                console.log('parsedResponse', parsedResponse);
            });
    }
}

export default Cart;