Visit https://soney.github.io/snn-from-scratch

# Initializing

1. Create a virtual environment in the `.venv` directory.
```bash
python3 -m venv .venv
```
2. Activate the virtual environment.
```bash
source .venv/bin/activate
```
...or if you are on Windows, `.\.venv\Scripts\activate`.

3. Install the required packages.
```bash
pip install -r requirements.txt
```
4. Install the node packages.
```bash
npm install
```
5. Build
```bash
npm run build
```

# JavaScript Components

As webpack is compiling, it runs a loader for `.ts` files (named `component-spec-loader.js`) that contain a comment formatted in the style `/*spec-start ... spec-end*/`. Whatever is between these two tags should be a JSON-formatted string in the following format:

```javascript
/*spec-start {
    "name": "bucket",
    "has_content": true,
    "required_arguments": 0,
    "optional_arguments": 3,
    "option_names": ["key1", "key2"]
} spec-end*/
```

- `name`: The name of the component.
- `has_content`: Whether the component has content.
- `required_arguments`: The number of required arguments.
- `optional_arguments`: The number of optional arguments.
- `option_names`: The names of the optional arguments.

These comments are then combined into a JSON file (`ext/component-spec.json`) that is then read by `ext/javascript.py` to create a bunch of custom Sphinx components.
