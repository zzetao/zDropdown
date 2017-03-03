// Utils
const utils = {
 	addEventListener: (el, type, fn) => {
 		if (el.attachEvent) {
 			return el.attachEvent('on' + type, fn);
 		} else {
 			return el.addEventListener(type, fn, false);
 		}
 	},

 	removeEventListener: (el, type, fn) => {
 		if (el.detachEvent) {
 			return el.detachEvent('on' + type, fn);
 		} else {
 			return el.removeEventListener(type, fn, false);
 		}
 	},

  isElement: obj => {
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
  addClass: (el, className) => {
    if (el.classList)
      el.classList.add(className);
    else
      el.className += ' ' + className;
  },
  removeClass: (el, className) => {
    if (el.classList)
      el.classList.remove(className);
    else
      el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
  },
  closest: (el, s) => {
    var matches = (document || ownerDocument).querySelectorAll(s),
        i;
    do {
        i = matches.length;
        while (--i >= 0 && matches.item(i) !== el) {};
    } while ((i < 0) && (el = el.parentElement)); 
    return el;
  }
};


class Dropdown {
  constructor(options = {}) {
    /*
      options = {
        el: String | Node (select),
        skin: String,
        change: Function,
        changeItem: Function
      }
    */

    this.options = options;
    this.init(options);

    return {
      destroy: this.destroy.bind(this),
      changeItem: this.changeItem.bind(this)
    }
  }
  
  init ({ el }) {
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

    el.style.display = 'none';
    
    let { options } = el;
    let { selectedIndex } = options;
    
    this.items = [];
    if (options.length > 0) {
      for ( let option of options ) {
        this.items.push({
          value: option.value,
          text: option.innerText
        });
      };
    }
    
    this.selectTagDOM = el;
    this.render(selectedIndex);
  }

  /**
   * 渲染 Dropdown
   * @param  {Number} selectedIndex 默认选择项索引
   * @return 
   */
  render (selectedIndex = 0) {
    let { options, items } = this;
    let skin = options.skin ? ' ' + options.skin : '';

    let dropdownWrap = document.createElement('div'),
        dropdownDefault = document.createElement('div'),
        dropdownArrow = document.createElement('i'),
        dropdownContainer = document.createElement('ul');

    dropdownWrap.className = "z-dropdown" + skin;
    dropdownArrow.className = "z-dropdown-arrow";
    dropdownContainer.className = "z-dropdown-container";

    dropdownDefault.className = "z-dropdown-default";
    dropdownDefault.innerText = (items[selectedIndex] && items[selectedIndex].text) || "none";

    
    let itemHtml = "";
    for(let [index, item] of Object.entries(items)) {
      let selected = index == selectedIndex ? "selected" : "";
      itemHtml += `<li class="${selected}" index="${index}" value="${item.value}">${item.text}</li>`;
    }
    dropdownContainer.innerHTML = itemHtml;

    dropdownWrap.appendChild(dropdownArrow);
    dropdownWrap.appendChild(dropdownDefault);
    dropdownWrap.appendChild(dropdownContainer);
  
    this.dropdownContainer = dropdownContainer;
    this.dropdownArrow     = dropdownArrow;
    this.dropdownWrap      = dropdownWrap;
    this.dropdownDefault   = dropdownDefault;
    
    // insert dom
    this.selectTagDOM.parentNode.insertBefore(dropdownWrap, this.selectTagDOM);
    
    this.addListener();
  }

  /**
   * 更改选择项
   * @param  {Number} index 选择项索引
   * @return 
   */
  changeItem (index) {
    let { items, options, selectTagDOM, dropdownContainer, dropdownDefault } = this;
    let currentIndex = selectTagDOM.selectedIndex;

    index = index || 0;

    let item = items[index];

    if (index > items.length) {
      return;
    }

    options.change && options.change(item.value, item.text, index);

    if (index == currentIndex) {
      return;
    }

    dropdownDefault.innerText = item.text;
    utils.removeClass(dropdownContainer.children[selectTagDOM.selectedIndex], "selected");
    utils.addClass(dropdownContainer.children[index], "selected");

    selectTagDOM.selectedIndex = index;
  }
  
  /**
   * 移除监听事件
   */
  removeListener () {
    utils.removeEventListener(this.selectTagDOM, 'change', this.selectChangeHandler);
    utils.removeEventListener(this.dropdownWrap, 'click', this.wrapClickHandler);
    utils.removeEventListener(document, 'click', this.documentClickHandler);
  }

  /**
   * 添加监听事件
   */
  addListener () {
    this.wrapClickHandler     = this.wrapClickHandler.bind(this);
    this.selectChangeHandler  = this.selectChangeHandler.bind(this);
    this.documentClickHandler = this.documentClickHandler.bind(this);

    utils.addEventListener(this.selectTagDOM, 'change', this.selectChangeHandler);
    utils.addEventListener(this.dropdownWrap, 'click', this.wrapClickHandler);
  }

  /**
   * Drowdown 点击处理事件
   * @param  {Object} e  Event
   * @return
   */
  wrapClickHandler (e) {
    let { items } = this;
    let target = e.target || e.srcElement;
    this.isShowContainer = !this.isShowContainer;

    let toggleClass = this.isShowContainer ? utils.addClass : utils.removeClass;
    toggleClass(this.dropdownWrap, "active");

    // click item
    if (target.nodeName.toLowerCase() === "li") {
      let index = target.getAttribute("index"),
          item  = items[index];

      this.changeItem(index);

      utils.removeEventListener(document, 'click', this.documentClickHandler);  
    } else {
      utils.addEventListener(document, 'click', this.documentClickHandler);
    }
  }

  selectChangeHandler (e) {
    let target = e.target || e.srcElement;
    this.changeItem(target.selectedIndex);
  }

  documentClickHandler (e) {
    let target = e.target || e.srcElement;
    let parent = utils.closest(target, '.z-dropdown');

    if (!parent) {
      this.isShowContainer = false;
      utils.removeClass(this.dropdownWrap, "active");

      utils.removeEventListener(document, 'click', this.documentClickHandler);
    }
  }

  /**
   * 销毁 Drowdown
   * @return
   */
  destroy () {
    if (this.isDestroy) {
      return;
    }

    this.removeListener();
    this.dropdownWrap.parentNode.removeChild(this.dropdownWrap);
    this.dropdownWrap = this.dropdownDefault = this.dropdownArrow = this.dropdownContainer = null;
    this.selectTagDOM.style.display = "";
    this.isDestroy = true;
  }
}

module.exports = Dropdown;