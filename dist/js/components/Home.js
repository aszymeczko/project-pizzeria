import { templates, select, settings, classNames } from '../settings.js';
// import utils from '../utils.js';
// import AmountWidget from './AmountWidget.js';
// import DatePicker from './DatePicker.js';
// import HourPicker from './HourPicker.js';

class Home {
    constructor(element) {
        const thisHome = this;

        thisHome.render(element);
        thisHome.initLinks()

    }
    render(element) {
        const thisHome = this;

        const generatedHTML = templates.homeWidget();
        thisHome.dom = {};
        thisHome.dom.wrapper = element;

        thisHome.dom.wrapper.innerHTML = generatedHTML;

    }

    initLinks() {
        const thisHome = this;
        thisHome.pages = document.querySelector(select.containerOf.pages).children;
        thisHome.navLinks = document.querySelectorAll(select.nav.links);

        thisHome.links = document.querySelectorAll('.wraper-1 a');

        for (let link of thisHome.links) {
            link.addEventListener('click', function (event) {
                const clickedElement = this;
                event.preventDefault();

                /* get page id from href attribute */
                const id = clickedElement.getAttribute('href').replace('#', '');

                /* run thisApp.activatePage with that id */
                thisHome.activatePage(id);

                /* change URL hash */
                window.location.hash = '#/' + id;
            });
        }
    }

    activatePage(pageId) {
        const thisHome = this;
        /* add class "active" to matching pages, remove from non-maching */
        for (let page of thisHome.pages) {
            page.classList.toggle(classNames.pages.active, page.id == pageId);
        }

        /* add class "active" to matching links, remove from non-maching */
        for (let link of thisHome.navLinks) {
            link.classList.toggle(
                classNames.nav.active,
                link.getAttribute('href') == '#' + pageId
            );
        }
    }





}

export default Home;