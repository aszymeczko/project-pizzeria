import { templates, select, settings, classNames } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
    constructor(element) {
        const thisBooking = this;

        thisBooking.selectedTable = false;
        thisBooking.render(element);
        thisBooking.initWidgets();
        thisBooking.initForm();
        thisBooking.getData();
    }

    getData() {
        const thisBooking = this;

        const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
        const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

        const params = {
            booking: [
                startDateParam,
                endDateParam,
            ],
            eventsCurrent: [
                settings.db.notRepeatParam,
                startDateParam,
                endDateParam,
            ],
            eventsRepeat: [
                settings.db.repeatParam,
                endDateParam,
            ],
        };

        const urls = {
            booking: settings.db.url + '/' + settings.db.bookings
                + '?' + params.booking.join('&'),
            eventsCurrent: settings.db.url + '/' + settings.db.events
                + '?' + params.eventsCurrent.join('&'),
            eventsRepeat: settings.db.url + '/' + settings.db.events
                + '?' + params.eventsRepeat.join('&'),
        };

        Promise.all([
            fetch(urls.booking),
            fetch(urls.eventsCurrent),
            fetch(urls.eventsRepeat),
        ])
            .then(function (allResponses) {
                const bookingsResponse = allResponses[0];
                const eventsCurrentResponse = allResponses[1];
                const eventsRepeatResponse = allResponses[2];
                return Promise.all([
                    bookingsResponse.json(),
                    eventsCurrentResponse.json(),
                    eventsRepeatResponse.json(),
                ]);
            })
            .then(function ([bookings, eventsCurrent, eventsRepeat]) {
                thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
            });
    }

    parseData(bookings, eventsCurrent, eventsRepeat) {
        const thisBooking = this;

        thisBooking.booked = {};

        for (let item of bookings) {
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }

        for (let item of eventsCurrent) {
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }

        const minDate = thisBooking.datePicker.minDate;
        const maxDate = thisBooking.datePicker.maxDate;

        for (let item of eventsRepeat) {
            if (item.repeat == 'daily') {
                for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
                    thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
                }
            }
        }

        thisBooking.updateDOM();
    }

    makeBooked(date, hour, duration, table) {
        const thisBooking = this;

        if (typeof thisBooking.booked[date] == 'undefined') {
            thisBooking.booked[date] = {};
        }

        const startHour = utils.hourToNumber(hour);

        for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {

            if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
                thisBooking.booked[date][hourBlock] = [];
            }

            thisBooking.booked[date][hourBlock].push(table);
        }
    }

    updateDOM() {
        const thisBooking = this;

        thisBooking.date = thisBooking.datePicker.value;
        thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

        let allAvaliable = false;

        if (
            typeof thisBooking.booked[thisBooking.date] == 'undefined'
            ||
            typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
        ) {
            allAvaliable = true;
        }

        for (let table of thisBooking.dom.tables) {
            let tableId = table.getAttribute(settings.booking.tableIdAttribute);
            if (!isNaN(tableId)) {
                tableId = parseInt(tableId);
            }

            if (
                !allAvaliable
                &&
                thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
            ) {
                table.classList.add(classNames.booking.tableBooked);
            } else {
                table.classList.remove(classNames.booking.tableBooked);
            }
        }
    }

    render(element) {
        const thisBooking = this;

        const generatedHTML = templates.bookingWidget();

        thisBooking.dom = {};

        thisBooking.dom.wrapper = element;

        thisBooking.dom.wrapper.innerHTML = generatedHTML;

        thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);

        thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);

        thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);

        thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

        thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);

        thisBooking.dom.tablesWrapper = thisBooking.dom.wrapper.querySelector(select.booking.tablesDiv);


    }

    initWidgets() {
        const thisBooking = this;

        thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);

        thisBooking.dom.peopleAmount.addEventListener('updated', function () {
            thisBooking.resetSelectedTable();
        });

        thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

        thisBooking.dom.hoursAmount.addEventListener('updated', function () {
            thisBooking.resetSelectedTable();
        });

        thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);

        thisBooking.dom.datePicker.addEventListener('updated', function () {
            thisBooking.resetSelectedTable();
        });

        thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

        thisBooking.dom.hourPicker.addEventListener('updated', function () {
            thisBooking.resetSelectedTable();
        });

        thisBooking.dom.wrapper.addEventListener('updated', function () {
            thisBooking.updateDOM();
        });

        thisBooking.dom.tablesWrapper.addEventListener('click', function (event) {
            thisBooking.initTables(event.target);
        });
    }


    initForm() {
        const thisBooking = this;

        thisBooking.dom.form = thisBooking.dom.wrapper.querySelector('.order-confirmation');
        thisBooking.dom.formSubmit = thisBooking.dom.form.querySelector('.btn-secondary');

        thisBooking.dom.formSubmit.addEventListener('click', function (event) {
            event.preventDefault();
            thisBooking.sendBooking();
        })
    }

    initTables(target) {
        const thisBooking = this;
        const clickedElement = target;

        // Check if the clicked item is a table
        if (clickedElement.classList.contains(classNames.booking.table)) {
            // Get the table ID
            const tableId = clickedElement.getAttribute(settings.booking.tableIdAttribute);

            // Check if the table is taken
            if (clickedElement.classList.contains(classNames.booking.tableBooked)) {
                alert('Ten stolik jest już zajęty.');
                return;
            }

            // If the table is already selected, remove the selection
            if (clickedElement.classList.contains(classNames.booking.selected)) {
                clickedElement.classList.remove(classNames.booking.selected);
                thisBooking.selectedTable = false;

            } else {
                // Remove the check mark if another table was selected
                if (thisBooking.selectedTable !== false) {
                    const previouslySelected = thisBooking.dom.wrapper.querySelector(
                        `[${settings.booking.tableIdAttribute}="${thisBooking.selectedTable}"]`
                    );
                    if (previouslySelected) {
                        previouslySelected.classList.remove(classNames.booking.selected);
                    }
                }

                // Select a new table
                clickedElement.classList.add(classNames.booking.selected);
                thisBooking.selectedTable = tableId;
            }
        }
    }

    resetSelectedTable() {
        const thisBooking = this;

        // Check that the table is selected
        if (thisBooking.selectedTable !== false) {
            const previouslySelected = thisBooking.dom.wrapper.querySelector(
                `[${settings.booking.tableIdAttribute}="${thisBooking.selectedTable}"]`
            );
            if (previouslySelected) {
                previouslySelected.classList.remove(classNames.booking.selected);
            }
            thisBooking.selectedTable = false; // Reset the selected table
        }
    }

    sendBooking() {
        const thisBooking = this;

        const url = settings.db.url + '/' + settings.db.bookings;

        const formWraper = document.querySelector(".order-confirmation");

        const inputPhone = formWraper.querySelector("input[name='phone']");

        const inputAddress = formWraper.querySelector("input[name='address']");

        const bookingOptions = document.querySelector(".booking-options");

        if (!inputPhone.value || !inputAddress.value) {
            console.error('Brakuje wymaganych pól w formularzu.');
            return;
        }

        const payload = {
            date: thisBooking.date,
            hour: thisBooking.hour,
            table: parseInt(thisBooking.selectedTable) || null,
            duration: parseInt(thisBooking.peopleAmount.correctValue),
            ppl: parseInt(thisBooking.hoursAmount.correctValue),
            starters: [],
            phone: inputPhone.value,
            address: inputAddress.value,
        };

        const starterCheckboxes = bookingOptions.querySelectorAll('input[name="starter"]:checked');
        starterCheckboxes.forEach(checkbox => payload.starters.push(checkbox.value));


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
                thisBooking.makeBooked(payload.date, thisBooking.hourPicker.correctValue, payload.duration, parseInt(payload.table));
            });
    }
}

export default Booking;