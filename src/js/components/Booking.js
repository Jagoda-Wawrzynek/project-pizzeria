import {templates, select, settings} from '../settings.js';
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
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
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
  
    console.log('getData params', params);

    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking,
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent,
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat,
    };
    
    console.log('getData urls', urls);

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
    //console.log('thisBooking', thisBooking.booked);

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
    
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;
    //console.log('param', date, hour, duration, table);
    
    if (!thisBooking.booked[date]) {
      thisBooking.booked[date] = {};
    }
    const hourNumber = utils.hourToNumber(hour);
    const nextHourNumber = hourNumber + duration;

    for (let i = hourNumber; i < nextHourNumber; i += 0.5){
      if (!thisBooking.booked[date][i]) {
        thisBooking.booked[date][i] = [];
      }
      
      thisBooking.booked[date][i].push(table);

      console.log('thisBooking.booked', thisBooking.booked);
      console.log('i', i);
    }
    
  }
}