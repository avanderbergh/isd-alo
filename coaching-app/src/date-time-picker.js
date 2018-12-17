import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';

import '@vaadin/vaadin-date-picker/vaadin-date-picker.js';
import '@vaadin/vaadin-time-picker/vaadin-time-picker.js';


/**
 * `DateTime picker returning date as YYYY-MM-DDTHH:MM:SSZ` Description
 *
 * @customElement
 * @polymer
 * @demo
 * 
 */
class DateTimePicker extends PolymerElement {
    static get properties() {
        return {
            formData:{
                type:Object,
                value:{}
            },
            dateTimeFormat:{
                type:String,
                notify:true,
                computed:'computeDateTimeFormat(formData.datePicker,formData.timePicker)'
            }

        }
    }
computeDateTimeFormat(d,t){
    var fdt =  d + 'T' + t +':00Z'
    console.log(fdt)
    return fdt;
}



    static get template() {
        return html`

         <vaadin-date-picker id="datePicker" label="Date" placeholder="Pick a date" value="{{formData.datePicker}}"></vaadin-date-picker>
        <vaadin-time-picker id="timePicker" step="1800" label="Pick Time (hh:mm)" value="{{formData.timePicker}}"></vaadin-time-picker>
        
        `;
    }

    /**
     * Instance of the element is created/upgraded. Use: initializing state,
     * set up event listeners, create shadow dom.
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * Use for one-time configuration of your component after local
     * DOM is initialized.
     */
    ready() {
        super.ready();
    }
}

customElements.define('date-time-picker', DateTimePicker);