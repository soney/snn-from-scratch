from docutils import nodes
from docutils.parsers.rst import Directive
from sphinx.application import Sphinx
from sphinx.util.typing import ExtensionMetadata
import json
import os
import re

def escape(s: str) -> str:
    return s.replace('"', "&quot;")
    
def construct_class(spec):
    name = spec.get('name', '')
    class Cls(Directive):
        has_content        = spec.get('has_content', True)
        required_arguments = spec.get('required_arguments', 0)
        optional_arguments = spec.get('optional_arguments', 0)
        # option_spec        = { k: lambda arg: arg for k in spec.get('option_names', []) }
        option_spec        = { k: lambda arg: "True" if arg == None else arg for k in spec.get('option_names', []) } # For some reason, when the value is "true", it is converted to None
        cls_counter        = 0
    
        def run(self):
            Cls.cls_counter += 1
            content = '\n'.join(self.content)
            my_hash = hash(json.dumps({
                'arguments': self.arguments,
                'options': self.options,
                'content': content,
            }))
            node = nodes.raw("", f'''<div class="custom---{name}"
                                          data-arguments = "{escape(json.dumps(self.arguments))}"
                                          data-options   = "{escape(json.dumps(self.options))}"
                                          data-content   = "{escape(json.dumps(content))}"
                                          id             = "{name}-{Cls.cls_counter}-hash{my_hash}"
                                          ></div>''', format="html")
            return [node]

    return Cls

def setup(app: Sphinx) -> ExtensionMetadata:
    with open(os.path.join(os.path.dirname(__file__), 'component-spec.json')) as f:
        content = f.read()
        specs = json.loads(content)
        for spec in specs:
            app.add_directive(spec['name'], construct_class(spec))

    return {
        'version': '0.1',
        'parallel_read_safe': True,
        'parallel_write_safe': True,
    }