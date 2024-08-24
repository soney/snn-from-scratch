import { RegisterArgs, Registration } from "../index";
/*spec-start {
    "name": "test",
    "has_content": true,
    "required_arguments": 0,
    "optional_arguments": 3,
    "option_names": ["key1", "key2"]
} spec-end*/


export default {
    name: "test",
    register: function (element: Element, {args, options, content}: RegisterArgs): void {
        const argList = document.createElement("ul");
        for (const arg of args) {
            const argElement = document.createElement("li");
            argElement.textContent = arg;
            argList.append(argElement);
        }

        const opts = document.createElement("ul");
        for (const key in options) {
            const optElement = document.createElement("li");
            optElement.textContent = `${key}: ${options[key]}`;
            opts.append(optElement);
        }

        const contentPre = document.createElement("pre");
        contentPre.textContent = content;

        element.append("Arguments:", argList, "Options:", opts, contentPre);
    }
} as Registration;