import { select, settings } from '../settings.js';

class AmountWidget {
    constructor(element) {
        const thisWidget = this;

        // console.log('AmountWidget:', thisWidget);
        // console.log('constructor arguments:', element);

        thisWidget.getElements(element);
        thisWidget.initActions();

        // check if thisWidget.input.value is given
        const initialValue = thisWidget.input.value || settings.amountWidget.defaultValue;

        // Set the value based on the availability of thisWidget.input.value
        thisWidget.setValue(initialValue);
    }

    getElements(element) {
        const thisWidget = this;

        thisWidget.element = element;
        thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
        thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
        thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value) {
        const thisWidget = this;
        const newValue = parseInt(value);

        /* TO DO: Add validation */
        if (thisWidget.value !== newValue && !isNaN(newValue) && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {
            thisWidget.value = newValue;
        }
        thisWidget.input.value = thisWidget.value;
        thisWidget.announce();
    }

    initActions() {
        const thisWidget = this;
        // console.log('thisWidget', thisWidget)

        thisWidget.input.addEventListener('change', function () { thisWidget.setValue(thisWidget.input.value) });
        thisWidget.linkDecrease.addEventListener('click', function () { thisWidget.setValue(thisWidget.value - 1) });
        thisWidget.linkIncrease.addEventListener('click', function () { thisWidget.setValue(thisWidget.value + 1) });
    }

    announce() {
        const thisWidget = this;

        const event = new CustomEvent('updated', {
            bubbles: true
        });

        thisWidget.element.dispatchEvent(event);
    }
}

export default AmountWidget;