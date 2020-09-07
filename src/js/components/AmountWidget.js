import {select, settings} from '../settings.js';
import {BaseWidget} from './BaseWidget.js';

export class AmountWidget extends BaseWidget{
  constructor(wrapper){
    super(wrapper, settings.amountWidget.defaultValue);
    
    const thisWidget = this;
      
    thisWidget.getElements();
    thisWidget.initActions();
    //thisWidget.value = settings.amountWidget.defaultValue;
    //thisWidget.setValue(thisWidget.input.value);


    //console.log('AmountWidget:', thisWidget);
    //console.log('constructor arguments:', element);
  }

  getElements(){
    const thisWidget = this;
    
    //thisWidget.element = element;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }

  isValid(value){
    return !isNaN(value) 
    && value >= settings.amountWidget.defaultMin 
    && value <= settings.amountWidget.defaultMax;
  }

  renderValue(){
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
  }

  initActions(){
    const thisWidget = this; 
      
    thisWidget.dom.input.addEventListener('change', function(){
      thisWidget.value = thisWidget.dom.input.value;
    });
    thisWidget.dom.linkDecrease.addEventListener('click', function(event) {
      event.preventDefault(); 
      thisWidget.value = (thisWidget.dom.value--);
    });
    thisWidget.dom.linkIncrease.addEventListener('click', function(event) {
      event.preventDefault();
      thisWidget.value = (thisWidget.dom.value++);
    });
  }

}