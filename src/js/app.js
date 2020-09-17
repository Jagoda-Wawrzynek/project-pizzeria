import {Product} from './components/Product.js';
import {Cart} from './components/Cart.js';
import {Booking} from './components/Booking.js';
import {select, settings, classNames} from './settings.js';

/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

//const { init } = require("browser-sync");

const app = {
  initPages: function(){
    const thisApp = this;

    thisApp.pages = Array.from(document.querySelector(select.containerOf.pages).children);
    thisApp.navLinks = Array.from(document.querySelectorAll(select.nav.links));
    thisApp.navHomeLinks = Array.from(document.querySelectorAll(select.nav.homeLinks));

    //thisApp.activatePage(thisApp.pages[0].id);
    let pagesMatchingHash = [];

    if(window.location.hash.length > 2) {
      const idFromHash = window.location.hash.replace('#/', '');

      for(let page of thisApp.pages){
        if(page.id == idFromHash){
          pagesMatchingHash.push(page);
        }
      }
    }

    if(pagesMatchingHash.length){
      thisApp.activatePage(pagesMatchingHash[0].id);
    } else {
      thisApp.activatePage(thisApp.pages[0].id);
    }

    thisApp.activatePage(pagesMatchingHash.length ? pagesMatchingHash[0].id : thisApp.pages[0].id);

    for(let link of thisApp.navLinks) {
      link.addEventListener('click', function(event){
        const clickedElement = this;
        event.preventDefault();
        /*get page if from href attribuet*/
        const id = clickedElement.getAttribute('href').replace('#', '');
        /*run thisAll.activatePage with that id*/
        thisApp.activatePage(id);
        //change URL hash 
        window.location.hash = '#/' + id;
      });
    }
    for(let link of thisApp.navHomeLinks) {
      link.addEventListener('click', function(event){
        const clickedElement = this;
        event.preventDefault();
        /*get page if from href attribuet*/
        const id = clickedElement.getAttribute('href').replace('#', '');
        /*run thisAll.activatePage with that id*/
        thisApp.activatePage(id);
        //change URL hash 
        window.location.hash = '#/' + id;
      });
    }
    
  },

  activatePage: function(pageId){
    const thisApp = this;

    /*add class "active" to matching pages, remove from non-matching*/
    for(let page of thisApp.pages) {
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }
    //console.log('newPage', thisApp.pages);
    /*add class "active" to matching links, remove from non-matching*/
    for(let link of thisApp.navLinks) {
      link.classList.toggle(classNames.nav.active, link.getAttribute('href') == '#' + pageId);
    }
    //console.log('newLink', thisApp.navLinks);
    for(let link of thisApp.navHomeLinks) {
      link.classList.toggle(classNames.nav.active, link.getAttribute('href') == '#' + pageId);
    }
  },

  initMenu: function(){
    const thisApp = this;
    //console.log('thisApp.data:', thisApp.data);
    
    for(let productData in thisApp.data.products){
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initData: function(){
    const thisApp = this;
  
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.product;
    
    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponse){

        /* save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;
        /* execute initMenu method */
        thisApp.initMenu();
        
      });
    //console.log('thisApp.data', JSON.stringify(thisApp.data));
  },

  initCart: function(){
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    });
  },

  initBooking: function(){
    const thisApp = this;

    const bookingWidget = document.querySelector(select.containerOf.booking);
    thisApp.booking = new Booking(bookingWidget);

  },

  init: function(){
    const thisApp = this;
    //console.log('*** App starting ***');
    //console.log('thisApp:', thisApp);
    //console.log('classNames:', classNames);
    //console.log('settings:', settings);
    //console.log('templates:', templates);
    
    thisApp.initPages();
    thisApp.initData();
    thisApp.initCart();
    thisApp.initBooking();
  },
};

app.init();