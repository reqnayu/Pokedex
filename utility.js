function qs(element) {
    return document.querySelector(element);
}

function qAll(element) {
    return document.querySelectorAll(element);
}

function vis(element, boolean) {
    if (boolean !== undefined) {
        element.classList.toggle('d-none', boolean)
    } else {
        element.classList.toggle('d-none');
    }
}

function capitalize(input) {
    if (!input) return "";
    const string = input.split('-');
    let output = [];
    for (let i = 0; i < string.length; i++){
        output.push(string[i][0].toUpperCase() + string[i].slice(1));
    }
    output = output.join(' ');
    return output;
}

const debounce = (cb, delay = 1000) => {
    let timeout
  
    return (...args) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        cb(...args)
      }, delay)
    }
  }

const log = console.log;