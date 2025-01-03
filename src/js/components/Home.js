import { templates, select, settings, classNames } from '../settings.js';
// import utils from '../utils.js';
// import AmountWidget from './AmountWidget.js';
// import DatePicker from './DatePicker.js';
// import HourPicker from './HourPicker.js';

class Home {
    constructor(element) {
        const thisHome = this;

        thisHome.render(element);

    }
    render(element) {
        const thisHome = this;

        const generatedHTML = templates.homeWidget();

        thisHome.dom = {};

        thisHome.dom.wrapper = element;

        thisHome.dom.wrapper.innerHTML = generatedHTML;

    }

}

export default Home;