import {select} from '../settings.js';
import {AmountWidget} from './AmountWidget.js';

export class CartProduct{
  constructor(menuProduct, element){
    const thisCartProduct = this;
    
    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.amount = menuProduct.amountWidget.value;
    thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
    thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));
  
    thisCartProduct.getElements(element);
    thisCartProduct.initAmountWidget();
    thisCartProduct.initActions();

    //console.log('new cartProduct', thisCartProduct);
    //console.log('productData', menuProduct);
  }
  
  getElements(element){
    const thisCartProduct = this;
    thisCartProduct.dom = {};
      
    thisCartProduct.dom.wrapper = element;
    thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
    thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
  }
  
  getData(){
    const thisCartProduct = this;

    const data = {
      id: thisCartProduct.id,
      name: thisCartProduct.name,
      price:  thisCartProduct.price,
      priceSingle:  thisCartProduct.priceSingle,
      amount:  thisCartProduct.amount,
      params:  thisCartProduct.params,
    };
  
    return data;
  }
  
  initAmountWidget(){
    const thisCartProduct = this;

    thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
    thisCartProduct.dom.amountWidget.addEventListener('updated', function (){
      thisCartProduct.amount = thisCartProduct.amountWidget.value;
      thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
          
      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
    });
  }
  
  initActions(){
    const thisCartProduct = this;

    thisCartProduct.dom.edit.addEventListener('click', function(event){
      event.preventDefault();
      thisCartProduct.edit();
    });
  
    thisCartProduct.dom.remove.addEventListener('click', function(event){
      event.preventDefault();
      thisCartProduct.remove();
    });
  }
  
  remove(){
    const thisCartProduct = this;

    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      },
    });
  
    thisCartProduct.dom.wrapper.dispatchEvent(event);
  }
}