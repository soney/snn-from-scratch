/*spec-start {
    "name": "html-element",
    "has_content": true,
    "required_arguments": 1,
    "optional_arguments": 0,
    "option_names": ["id", "class", "raw"]
} spec-end*/

import { RegisterArgs, Registration } from "../index";


export default {
    name: "html-element",
    register: function (element: HTMLElement, {args, options, content}: RegisterArgs): void {
        const elType = args[0];
        const newEl = document.createElement(elType);
        if(options.id) {
            newEl.setAttribute("id", options.id);
        }
        if(options.classes) {
            newEl.setAttribute("class", options.class);
        }

        if(options.raw) {
            newEl.innerHTML = content;
        } else {
            newEl.textContent = content;
        }

        element.appendChild(newEl);
    }
} as Registration;