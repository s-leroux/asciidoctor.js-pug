asciidoctor.js-pug
==================

Override asciidoctor.js html5 output with templates.
Currently, you can define templates as `pug` templates or programmatically using JavaScript objects.


[![Build Status](https://travis-ci.org/s-leroux/asciidoctor.js-pug.png?branch=master)](https://travis-ci.org/s-leroux/asciidoctor.js-pug)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Installation

    npm install --save asciidoctor.js-pug


## Basic usage
This syntax provides an API similar to the one provided by the Asciidoctor Ruby template API.

```js
// load asciidoctor.js
const asciidoctor = require('asciidoctor.js')();

// load asciidoctor.js-pug.
// This will register a new TemplateConverter with AsciiDoctor.
require('asciidoctor.js-pug');

// At this point, to convert a node, AsciiDoctor will try first to find
// a corresponding pug template in the directory passed in the
// `template_dirs` option. Then it will fallback
// to the default backend behavior if there is no specific template for
// that node.

const doc = asciidoctor.load('Hello world', { template_dirs: ['./path/to/template/directory'] });

console.log(doc.convert());
```

The template directory should contain one template per type of node you want to process. The template name is made of the node_name + an extension identifying the template engine.

For example, considering that folder:

    templates/
        paragraph.pug
        image.pug

All nodes of name 'image' or 'paragraph' will be processed by the corresponding `pug` template instead of the default handler for that node type.

The option `template_dirs` is an array. So you can specify several directories to load templates from. If there are several templates defined for the same node, the last one wins.


See the test/templates folder for some examples of templates.

## Advanced Usage
### Templates Caching
If you process your documents in batch, it is not efficient to reload the templates for each document. You can pre-load the templates once and pass them to the `Asciidoctor.load` method using the `templates` parameter:

```js
const asciidoctor = require('asciidoctor.js')();
const adt = require('asciidoctor.js-pug');

const templates = adt.load_templates('./path/to/template/directory');

const doc1 = asciidoctor.load('doc1', { templates: [templates] });
const doc2 = asciidoctor.load('doc2', { templates: [templates] });
const doc3 = asciidoctor.load('doc3', { templates: [templates] });
```

Beware: just like `template_dirs`, the `templates` option is an array.

### Template Literals
Using the `templates` option, you can provide a JavaScript objects that will be used as templates:

```js
const doc = asciidoctor.load('doc', {
  templates: [{
    image: (node, next) => {/* ... */},
    paragraph: (node, next) => {/* ... */},
  }],
});
```

You can specify several template literals. Once again, if several templates match the same node, the last one wins:

```js
// This will produce "IMAGE2" for each "image" block
const doc = asciidoctor.load('doc', {
  templates: [{
    image: (node, next) => 'IMAGE1',
    paragraph: (node, next) => {/* ... */},
  },{
    image: (node, next) => 'IMAGE2',
  }],
});
```

Internally, when `template_dirs` is provided, the templates in the given directories are loaded and prepend to the (possibly empty) `templates` array.
For example, the following piece of code:

```js
const doc = asciidoctor.load('Hello world', {
  template_dirs: ['./path/to/template/directory'],
  templates: [
    {
      paragraph: (node, next) => {/* ... */},
    }
  ],
});
```

will be processed exactly like this one:

```js
const doc = asciidoctor.load('Hello world', {
  templates: [
    adt.load_templates('./path/to/template/directory'),
    {
      paragraph: (node, next) => {/* ... */},
    }
  ],
});
```

In other words, when both `template_dirs` and `templates` are provided, `template_dirs` always has a _lower_ priority. If you need your template to be processed in a different order, you will have to explicitly load and pass them at the right position in the `templates` option.

### Transfering control to the next template
When templates are processed, you can use `next()` to execute the next _matching_ template in the template chain. This allows to conditionally override a template based on other attributes than the node name.

The following code sample will remove from the output all paragraphs having the role "SECRET" and will replace them with the word "CENSORED". Paragraph blocks without the "SECRET" role are processed as usual by the base converter.

```js
const doc = asciidoctor.load('Hello world', {
  templates: [{
    paragraph: (node, next) => {
      if (node.hasRole('SECRET')) {
        return '<div>CENSORED</div>';
      }

      // else
      return next();
    },
  }],
});
```

The `next()` function is also useful when you want to implement a decorator pattern:

```js
const doc = asciidoctor.load('Hello world', {
  templates: [{
      image: (node, next) => {
        return `<div class="image">${next()}</div>`;
      },
    }],
});
```

If `next()` is called and there are no more templates in the template chain, the control is transferred to the default backend implementation.

### Node
The node object if given as the first argument of the template function or using the suitable mechanism corresponding to your template engine. In Pug, the node is passed as the _local_ environment.

The context contains the following items:

* `node.content()` a function returning the content of the node. The content is passed through the converters before being returned.
* `node.image_uri()` a wrapper to the `image_uri` function provided by Asciidoctor to generate proper image URIs
* `node.attributes` the node attributes as a JavaScript object
* `node.roles` the block roles as a JavaScript `Set`


## Node version
Require NodeJS >= v7.0
Tested with v7.0, v7.6, v8.9 and the lastest LTS node versions

## License

(The MIT License)

Copyright (c) 2018 [Sylvain Leroux](mailto:sylvain@chicoree.fr)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
