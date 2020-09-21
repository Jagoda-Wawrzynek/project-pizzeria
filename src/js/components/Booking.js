import {select, settings, templates, classNames} from '../settings.js';
import {utils} from '../utils.js';
import {AmountWidget} from './AmountWidget.js';
import {DatePicker} from './DatePicker.js';
import {HourPicker} from './HourPicker.js';

export class Booking{
  constructor(element){
    const thisBooking = this;
  
    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
    //console.log('thisBookingSendReservation', thisBooking);
  }
  render(element) {
    const thisBooking = this;
    
    const generatedHtml = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    this.dom.wrapper.innerHTML = generatedHtml;

    thisBooking.dom.peopleAmount =  thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
    thisBooking.dom.adress = thisBooking.dom.wrapper.querySelector(select.booking.adress);
    thisBooking.dom.startes = thisBooking.dom.wrapper.querySelectorAll(select.booking.startes);
    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);
    
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });
    thisBooking.reservation();
    thisBooking.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisBooking.sendReservation();
      //console.log('test');
    });
    //console.log(thisBooking.dom.form);
  }

  getData(){
    const thisBooking = this;

    const startEndDates = {};
    startEndDates[settings.db.dateStartParamKey] = utils.dateToStr(thisBooking.datePicker.minDate);
    startEndDates[settings.db.dateEndParamKey] = utils.dateToStr(thisBooking.datePicker.maxDate);
  
    const endDate = {};
    endDate[settings.db.dateEndParamKey] = startEndDates[settings.db.dateEndParamKey];
  
    const params = {
      booking: utils.queryParams(startEndDates),
      eventsCurrent: settings.db.notRepeatParam + '&' + utils.queryParams(startEndDates),
      eventsRepeat: settings.db.repeatParam + '&' + utils.queryParams(endDate),
    };
  
    //console.log('getData params', params);

    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking,
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent,
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat,
    };
    
    //console.log('getData urls', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function([bookingsResponse, eventsCurrentResponse, eventsRepeatResponse]){
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};
    //console.log('eventsCurrent', eventsCurrent);
    
    for (const eventCurrent of eventsCurrent) {
      thisBooking.makeBooked(eventCurrent.date, eventCurrent.hour, eventCurrent.duration, eventCurrent.table);
    }
    for (const booking of bookings) {
      thisBooking.makeBooked(booking.date, booking.hour, booking.duration, booking.table);
    }
    
    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let event of eventsRepeat) {
      if (event.repeat === 'daily') {
        for (let currentDate = minDate; currentDate < maxDate; currentDate = utils.addDays(currentDate, 1)) {
          thisBooking.makeBooked(utils.dateToStr(currentDate), event.hour, event.duration, event.table);
        }
      }
    }
    //console.log('thisBooking', thisBooking.booked);
    //console.log('bookings', bookings);
    thisBooking.updateDOM();
    
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;
        
    if (!thisBooking.booked[date]) {
      thisBooking.booked[date] = {};
    }
    const hourNumber = utils.hourToNumber(hour);
    const nextHourNumber = hourNumber + duration;

    //console.log('hourToNumber', hourNumber);

    for (let i = hourNumber; i < nextHourNumber; i += 0.5){
      if (!thisBooking.booked[date][i]) {
        thisBooking.booked[date][i] = [];
      }
      
      thisBooking.booked[date][i].push(table);

      //console.log('thisBooking.booked', thisBooking.booked);
      //console.log('i', i);
    }
  }

  reservation(){
    const thisBooking = this;

    for(let tableReservation of thisBooking.dom.tables) {
      console.log('tableReservation', tableReservation);

      tableReservation.addEventListener('click', function(event) {
        event.preventDefault();
        if(tableReservation.classList.contains(classNames.booking.tableBooked)) {
          console.log('This table is already reserved! Choose a different table.');
          
        } else {
          tableReservation.classList.add(classNames.booking.tableBooked);
          console.log('Table was booked. Thank you and see you soon!');
          thisBooking.tableId = tableReservation.getAttribute('data-table');
          //console.log('tableReservation',thisBooking.tableId);
        }
      });

    }
  }

  sendReservation() {
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.booking;
    

    const payload = {
      date: thisBooking.date,
      hour: thisBooking.hourPicker.correctValue,
      table: parseInt(thisBooking.tableId),
      duration: thisBooking.hoursAmount.value,
      ppl: thisBooking.peopleAmount.correctValue, 
      phone: thisBooking.dom.phone.value,
      email: thisBooking.dom.adress.value,
      starters: [],
    };

    for(let starter of thisBooking.dom.startes){
      if(starter.checked == true) {
        payload.starters.push(starter.value);
      }
    }
    
    console.log('payload.hour', payload);
    
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
      })
      .then(function (parsedResponse) {
        console.log('parsedResponse', parsedResponse);
        thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);
        
        thisBooking.updateDOM();
      });
  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    //console.log('thisBooking.datePicker.value', thisBooking.datePicker.value);
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);
    //console.log('thisBooking.hour', thisBooking.hour);

    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      tableId = parseInt(tableId);

      if (thisBooking.booked[thisBooking.date] && thisBooking.booked[thisBooking.date][thisBooking.hour] && thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
    //console.log('AddReservation',thisBooking.booked[thisBooking.date]);
    thisBooking.SliderColour();
  }

  SliderColour() {
    const thisBooking = this;
    const rangeSlider = document.querySelector('.rangeSlider');
    
    const colorGradient = [];
    for (let i = 12; i < 24; i += 0.5) {
      
      if ((typeof thisBooking.booked[thisBooking.datePicker.value][i] == 'undefined') || thisBooking.booked[thisBooking.datePicker.value][i].length == 1) {
        let color = 'green';
        colorGradient.push(color);
        console.log('thisBooking.booked[thisBooking.datePicker.value][i]', thisBooking.booked[thisBooking.datePicker.value][i]);
      } else if (thisBooking.booked[thisBooking.datePicker.value][i].length == 2) {
        let color = 'orange';
        colorGradient.push(color);
        console.log('thisBooking.booked[thisBooking.datePicker.value][i]', thisBooking.booked[thisBooking.datePicker.value][i]);
      } else {
        let color = 'red';
        colorGradient.push(color);
        console.log('thisBooking.booked[thisBooking.datePicker.value][i]', thisBooking.booked[thisBooking.datePicker.value][i]);
      }
    }
    const linearGradient = colorGradient.join();
    console.log('linearGradient', linearGradient);
    const gradient = 'linear-gradient(to right, ' + linearGradient + ')';
    rangeSlider.style.backgroundImage =  gradient;
  }
}