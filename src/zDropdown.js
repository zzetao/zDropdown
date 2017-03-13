 /*!
 * zDropdown
 * (c) 2017 zzetao
 * Released under the MIT License.
 */
(function (window, factory) {

  if (typeof module !== "undefined" && typeof exports === "object" && define.cmd) {
      module.exports = factory();
  } else if (typeof define === "function" && define.amd) {
      define(function() { return factory(); });
  } else {
      window.zDropdown = factory();
  }

})(window, function() {

// Utils
var utils = {
  addEventListener: function (el, type, fn) {
    if (el.attachEvent) {
      return el.attachEvent("on" + type, fn);
    } else {
      return el.addEventListener(type, fn, false);
    }
  },

  removeEventListener: function (el, type, fn) {
    if (el.detachEvent) {
      return el.detachEvent("on" + type, fn);
    } else {
      return el.removeEventListener(type, fn, false);
    }
  },

  fireEvent: function (element, event) {
    if (document.createEventObject) {
      var evt = document.createEventObject();
      return element.fireEvent("on"+event,evt)
    } else {
      var evt = document.createEvent("HTMLEvents");
      evt.initEvent(event, true, true ); // event type,bubbling,cancelable
      return !element.dispatchEvent(evt);
    }
  },

  isElement: function (obj) {
    try {
      //Using W3 DOM2 (works for FF, Opera and Chrom)
      return obj instanceof HTMLElement;
    }
    catch(e){
      //Browsers not supporting W3 DOM2 don't have HTMLElement and
      //an exception is thrown and we end up here. Testing some
      //properties that all elements have. (works on IE7)
      return (typeof obj==="object") &&
        (obj.nodeType===1) && (typeof obj.style === "object") &&
        (typeof obj.ownerDocument ==="object");
    }
  },

  // http://youmightnotneedjquery.com/
  addClass: function (el, className) {
    if (el.classList)
      el.classList.add(className);
    else
      el.className += ' ' + className;
  },
  removeClass: function (el, className) {
    if (el.classList)
      el.classList.remove(className);
    else
      el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
  },
  closest: function (el, s) {
    var matches = (document || ownerDocument).querySelectorAll(s),
        i;
    do {
        i = matches.length;
        while (--i >= 0 && matches.item(i) !== el) {};
    } while ((i < 0) && (el = el.parentElement)); 
    return el;
  }
};

// Polyfill
if (!Function.prototype.bind) {
  Function.prototype.bind = function(oThis) {
    if (typeof this !== 'function') {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    }

    var aArgs   = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP    = function() {},
        fBound  = function() {
          return fToBind.apply(this instanceof fNOP
                 ? this
                 : oThis,
                 aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    if (this.prototype) {
      // Function.prototype doesn't have a prototype property
      fNOP.prototype = this.prototype; 
    }
    fBound.prototype = new fNOP();

    return fBound;
  };
}

function Dropdown (options) {
  this.options = options || {};
  this.init(this.options.el);

  return {
    destroy: this.destroy.bind(this),
    changeItem: this.changeItem.bind(this),
    update: this.updateItems.bind(this)
  }
}

Dropdown.prototype.init = function(el){
  if (!utils.isElement(el)) {
    el = document.getElementById(el);
  } else {
    if (el.tagName.toLowerCase() !== "select") {
      return console.log("[zDropdown]: Element is not select");
    }
  }
  if (el === null) {
    return console.log("[zDropdown]: No element found -> ", el);
  }

  el.style.display = "none";
  
  this.selectTagDOM = el;
  this.render();
}

Dropdown.prototype.render = function() {
  var options = this.options;

  var skin = options.skin ? " " + options.skin : "";

  var hasDisabled = this.selectTagDOM.getAttribute("disabled");
  if (hasDisabled) {
    this.hasDisabled = true;
    skin += " disabled";
  }

  var dropdownWrap = document.createElement("div"),
      dropdownDefault = document.createElement("div"),
      dropdownArrow = document.createElement("i"),
      dropdownContainer = document.createElement("ul");

  dropdownWrap.className = "z-dropdown" + skin;
  dropdownArrow.className = "z-dropdown-arrow";
  dropdownContainer.className = "z-dropdown-container";
  dropdownDefault.className = "z-dropdown-default";

  dropdownWrap.appendChild(dropdownArrow);
  dropdownWrap.appendChild(dropdownDefault);
  dropdownWrap.appendChild(dropdownContainer);

  this.dropdownContainer = dropdownContainer;
  this.dropdownArrow     = dropdownArrow;
  this.dropdownWrap      = dropdownWrap;
  this.dropdownDefault   = dropdownDefault;
  
  this.selectTagDOM.parentNode.insertBefore(dropdownWrap, this.selectTagDOM);
  
  this.updateItems();
  this.addListener();
}


Dropdown.prototype.updateItems = function() {
  var elOptions = this.selectTagDOM.options;
  var selectedIndex = elOptions.selectedIndex;

  // 从 select 获取 items
  var items = [];
  if (elOptions.length > 0) {
    for(var i = 0, len = elOptions.length; i < len; i++) {
      var item = elOptions[i];
      items.push({
        value: item.value,
        text: item.innerText
      })
    }
  }
  this.items = items;


  // 拼接 items 
  var itemHtml = "";

  for(var i = 0, len = items.length; i < len; i++) {
    var selected = i == selectedIndex ? "selected" : "";
    var item = items[i];
    itemHtml += '<li class="' + selected + '" index="' + i + '" value="' + item.value + '">' + item.text + '</li>';
  }

  this.dropdownContainer.innerHTML = itemHtml;
  this.dropdownDefault.innerText = (items[selectedIndex] && items[selectedIndex].text) || "none";
  this.currentIndex = selectedIndex;

  var self = this;

  // disabled
  setTimeout(function(){
    var hasDisabled = self.selectTagDOM.getAttribute("disabled");
    // ie hasDisabled = String, chrome hasDisabled = null
    var toggleClass = !hasDisabled ? utils.removeClass : utils.addClass;
    toggleClass(self.dropdownWrap, "disabled");
  }, 0)
}

/**
 * 更改选择项
 * @param  {Number} index 选择项索引
 * @return 
 */
Dropdown.prototype.changeItem = function(index) {

  var items = this.items,
      selectTagDOM = this.selectTagDOM,
      dropdownContainer = this.dropdownContainer,
      dropdownDefault = this.dropdownDefault,
      currentIndex = this.currentIndex;

  index = index || 0;

  var item = items[index];

  if (index > items.length || index == currentIndex) {
    return;
  }

  dropdownDefault.innerText = item.text;
  utils.removeClass(dropdownContainer.children[currentIndex], "selected");
  utils.addClass(dropdownContainer.children[index], "selected");

  selectTagDOM.selectedIndex = index;

  this.currentIndex = index;
}

Dropdown.prototype.removeListener = function(){
  utils.removeEventListener(this.selectTagDOM, "change", this.selectChangeHandler);
  utils.removeEventListener(this.dropdownWrap, "click", this.wrapClickHandler);
  utils.removeEventListener(document, "click", this.documentClickHandler);
}
Dropdown.prototype.addListener = function(){
  this.wrapClickHandler     = this.wrapClickHandler.bind(this);
  this.selectChangeHandler  = this.selectChangeHandler.bind(this);
  this.documentClickHandler = this.documentClickHandler.bind(this);

  utils.addEventListener(this.selectTagDOM, "change", this.selectChangeHandler);
  utils.addEventListener(this.dropdownWrap, "click", this.wrapClickHandler);
}

/**
 * Dropdown 点击处理事件
 * @param  {Object} e  Event
 * @return
 */
Dropdown.prototype.wrapClickHandler = function(e) {
  var target = e.target || e.srcElement,
      options = this.options,
      items = this.items;

  // select 是禁用状态，点击无效
  var hasDisabled = this.selectTagDOM.getAttribute("disabled");
  if (hasDisabled && !this.isShowContainer) {
    return;
  }

  this.isShowContainer = !this.isShowContainer;

  var toggleClass = this.isShowContainer ? utils.addClass : utils.removeClass;
  toggleClass(this.dropdownWrap, "active")

  // click item
  if (target.nodeName.toLowerCase() === "li") {
    var index = target.getAttribute("index"),
        item  = items[index];

    this.changeItem(index);
    utils.fireEvent(this.selectTagDOM, "change"); // trigger selectTagDOM change event
    options.change && options.change(item.value, item.text, index); // change callback

    utils.removeEventListener(document, "click", this.documentClickHandler);  
  } else {
    utils.addEventListener(document, "click", this.documentClickHandler);
  }
}

/**
 * select 更改事件
 * @param  {Object} e Event
 * @return
 */
Dropdown.prototype.selectChangeHandler = function (e){
  var target = e.target || e.srcElement;
  this.changeItem(target.selectedIndex);
}

Dropdown.prototype.documentClickHandler = function(e) {
  var target = e.target || e.srcElement;
  var parent = utils.closest(target, ".z-dropdown");

  if (!parent) {
    this.isShowContainer = false;
    utils.removeClass(this.dropdownWrap, "active");

    utils.removeEventListener(document, "click", this.documentClickHandler);
  }
}

Dropdown.prototype.destroy = function() {
  if (this.isDestroy) {
    return;
  }

  this.removeListener();
  this.dropdownWrap.parentNode.removeChild(this.dropdownWrap);
  this.dropdownWrap = this.dropdownDefault = this.dropdownArrow = this.dropdownContainer = null;
  this.selectTagDOM.style.display = "";
  this.isDestroy = true;
}

return Dropdown;

})