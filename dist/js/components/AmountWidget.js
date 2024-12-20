import { select, settings } from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget {
    constructor(element) {
        super(element, settings.amountWidget.defaultValue);
        const thisWidget = this;

        // console.log('AmountWidget:', thisWidget);
        // console.log('constructor arguments:', element);

        thisWidget.getElements(element);
        thisWidget.initActions();

        // check if thisWidget.dom.input.value is given
        const initialValue = thisWidget.dom.input.value || settings.amountWidget.defaultValue;

        // Set the value based on the availability of thisWidget.dom.input.value
        thisWidget.setValue(initialValue);
    }

    getElements() {
        const thisWidget = this;

        thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
        thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
        thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
    }

    isValid(value) {
        return !isNaN(value)
            && value >= settings.amountWidget.defaultMin
            && value <= settings.amountWidget.defaultMax;
    }

    renderValue() {
        const thisWidget = this;
        thisWidget.dom.input.value = thisWidget.value;
    }

    initActions() {
        const thisWidget = this;
        // console.log('thisWidget', thisWidget)

        thisWidget.dom.input.addEventListener('change', function () {
            thisWidget.value = thisWidget.dom.input.value;
        });

        thisWidget.dom.linkDecrease.addEventListener('click', function () {
            thisWidget.setValue(thisWidget.value - 1)
        });

        thisWidget.dom.linkIncrease.addEventListener('click', function () {
            thisWidget.setValue(thisWidget.value + 1)
        });
    }
}

export default AmountWidget;