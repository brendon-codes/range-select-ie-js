RangeIE
=======

JavaScript Range/Selection implementation for Internet Explorer

* *Author: Brendon Crawford*
* *Homepage: https://github.com/last/rangeie/*
* *Sponsored By: [Last.vc](http://last.vc)*

* [Mozilla Range documentation](https://developer.mozilla.org/en/DOM/range)
* [Mozilla Selection documentation](https://developer.mozilla.org/en/DOM/Selection)
* [W3C DOM Range documentation](http://www.w3.org/TR/DOM-Level-2-Traversal-Range/ranges.html)


Background
----------

Before IE9, IE only supports what is known as a TextRange object, but it
does not support the W3C DOM Range object nor does it support the Mozilla
Selection object. As a result, implementing cross-browser JavaScript
applications for manipulating and managing text ranges/selections can be
quite difficult.

RangeIE is not a 100% implementation of Range/Selection, but it does cover
most concepts.

Caveats
-------

RangeIE was originally intended to work with contenteditable divs
containing text, spans, and anchor elements. It has not been developed
to work with designmode documents, iframes, or contenteditable elements
containing images or block-level elements such as divs and lists.

Your script must call *ELM.focus()* before making any use of
RangeIE, where ELM is your contenteditable element, typically a div.

RangeIE so far has only been tested on IE8, and will not be necessary
for use in IE9.

When using *Range.selectNode(referenceNode)* and
*Range.selectNodeContents(referenceNode)*, *referenceNode* must be an instance
of a node which has been added to the document, via *insertBefore*,
*appendChild*, etc. If this is not the case, you will get an "invalid argument"
error.

Example Usage
-------------

    <script type="text/javascript" src="rangeie.js"></script>
    <script type="text/javascript">
        function deleteThirdElement() {
            var elm, range, child;
            elm = document.getElementById('editor');
            // Focus is mandatory before making any calls to RangeIE
            elm.focus();
            child = elm.childNodes[2];
            range = window.document.createRange();
            range.selectNode(child);
            range.deleteContents();
            range.detach();
            return false;
        }
    </script>
    <div id="editor" contenteditable="true" style="border:1px solid #000">
        Hello World
        <span>Foo Bar</span>
        Foo Baz
    </div>
    <div>
        <a href="javascript:deleteThirdElement();">Delete Third Element</a>
    </div>


