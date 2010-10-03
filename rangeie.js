/**
 * RangeIE
 * 
 * JavaScript Range/Selection implementation for Internet Explorer
 * 
 * Author: Brendon Crawford <brendon at aphexcreations dot net>
 * Sponsored By: Bay Street Capital <http://baystreetcapital.com>
 * Homepage: http://github.com/brendoncrawford/rangeie/
 * 
 * The Mozilla Range documentation can be found at:
 *     https://developer.mozilla.org/en/DOM/range
 * 
 * The Mozilla Selection documentation can be found at:
 *     https://developer.mozilla.org/en/DOM/Selection
 * 
 * The W3C DOM Range documentation can be found at:
 *     http://www.w3.org/TR/DOM-Level-2-Traversal-Range/ranges.html
 * 
 * #### Background ####
 * 
 * Before IE9, IE only supports what is known as a TextRange object, but it
 * does not support the W3C DOM Range object nor does it support the Mozilla
 * Selection object. As a result, implementing cross-browser JavaScript
 * applications for manipulating and managing text ranges/selections can be
 * quite difficult.
 * 
 * RangeIE is not a 100% implementation of Range/Selection, but it does cover
 * most concepts. Keep in mind that RangeIE was originally intended to
 * work with contenteditable divs containing text, spans, and anchor elements.
 * It has not been developed to work with designmode documents or
 * contenteditable elements containing images or block-level elements such
 * as divs and lists.
 * 
 * Please note that you must call ELM.focus() before making any use of
 * RangeIE, where ELM is your contenteditable element, typically a div.
 * 
 * Please also note that RangeIE so far has only been tested on IE8, and
 * will not be necessary for use in IE9.
 * 
 * #### Usage ####
 * 
 * <script type="text/javascript" src="rangeie.js"></script>
 * <script type="text/javascript">
 *     function deleteThirdElement() {
 *         var elm, range, child;
 *         elm = document.getElementById('editor');
 *         // Focus is mandatory before making any calls to RangeIE
 *         elm.focus();
 *         child = elm.childNodes[2];
 *         range = window.document.createRange();
 *         range.selectNode(child);
 *         range.deleteContents();
 *         range.detach();
 *         return false;
 *     }
 * </script>
 * <div id="editor" contenteditable="true" style="border:1px solid #000">
 *     Hello World
 *     <span>Foo Bar</span>
 *     Foo Baz
 * </div>
 * <div>
 *     <a href="javascript:deleteThirdElement();">Delete Third Element</a>
 * </div>
 * 
 * #### License ####
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * 
 */

RangeIE = {};

/**
 * Selection
 * 
 * @constructor
 * @see https://developer.mozilla.org/en/DOM/window.getSelection
 */
RangeIE.Selection = function() {
    var range;
    this._ranges = [];
    if (this._ranges.length === 0) {
        range = new RangeIE.Range;
        range._refresh();
        this.addRange(range);
    }
};

/**
 * Selection Instance Methods
 */
RangeIE.Selection.prototype = {

    /**
     * A range object that will be added to the selection.
     * 
     * @see https://developer.mozilla.org/en/DOM/Selection/addRange
     * @param {RangeIE.Range} range
     * @return {Bool}
     */
    addRange : function(range) {
        this._ranges.push(range);
        return true;
    },

    /**
     * Returns a range object representing one of the
     * ranges currently selected.
     * 
     * @see https://developer.mozilla.org/en/DOM/Selection/getRangeAt
     * @param {Int} index
     * @return {RangeIE.Range}
     */
    getRangeAt : function(index) {
        return this._ranges[index];
    },

    /**
     * Removes all ranges from the selection.
     * 
     * @see https://developer.mozilla.org/en/DOM/Selection/removeAllRanges
     * @return {Bool}
     */
    removeAllRanges : function() {
        var i;
        for (i = this._ranges.length-1; i >= 0; i--) {
            this._removeRange(i);
        }
        return true;
    },

    /**
     * Removes a range from the selection.
     * 
     * @see https://developer.mozilla.org/en/DOM/Selection/removeRange
     * @param {RangeIE.Range} range
     * @return {Bool}
     */
    removeRange : function(range) {
        var i, found;
        found = false;
        for (i = this._ranges.length-1; i >= 0; i--) {
            if (this._ranges[i] === range) {
                this._removeRange(i);
                found = true;
                break;
            }
        }
        return found;
    },

    /**
     * Moves the focus of the selection to the same point at the anchor.
     * 
     * @see https://developer.mozilla.org/en/DOM/Selection/collapseToStart
     * @return {Bool}
     */
    collapseToStart : function() {
        var range;
        if (this._ranges.length > 0) {
            range = this._ranges[0];
            range.collapse(true);
            range._range.select();
            return true;
        }
        else {
            return false;
        }
    },

    /**
     * Moves the anchor of the selection to the same point as the focus.
     * The focus does not move.
     * 
     * @see https://developer.mozilla.org/en/DOM/Selection/collapseToEnd
     * @return {Bool}
     */
    collapseToEnd : function() {
        var range;
        if (this._ranges.length > 0) {
            range = this._ranges[this._ranges.length-1];
            range.collapse(false);
            range._range.select();
            return true;
        }
        else {
            return false;
        }
    },

    /**
     * Returns a string currently being represented by the selection
     * object, i.e. the currently selected text. 
     * 
     * @see https://developer.mozilla.org/en/DOM/Selection/toString
     * @return {String}
     */
    toString : function() {
        var i, _i, ret;
        ret = '';
        for (i = 0, _i = this._ranges.length; i < _i; i++) {
            ret += this._ranges[i].toString();
            if (i < _i-1) {
                ret += ' ';
            }
        }
        return ret;
    },

    /**
     * Removes a range from the selection based on index.
     * 
     * @private
     * @param index
     * @return {Bool}
     */
    _removeRange : function(index) {
        this._ranges[index].detach();
        delete this._ranges[index];
        return true;
    }

};

/**
 * Range
 * 
 * @constructor
 * @see https://developer.mozilla.org/en/DOM/document.createRange
 */
RangeIE.Range = function() {
    var container;
    this._range = document.selection.createRange();
    this._bounder = window.document.activeElement;
    this._reset();
};

/**
 * Range Instance Methods
 */
RangeIE.Range.prototype = {

    /**
     * Sets the Range to contain the node and its contents. 
     * 
     * @see https://developer.mozilla.org/en/DOM/range.selectNode
     * @param {HTMLElement} referenceNode
     * @return {Bool}
     */
    selectNode : function(referenceNode) {
        var st;
        st = this._selectNode(referenceNode);
        if (st) {
            this._range.select();
            this._refresh();
        }
        else {
            this._reset();
        }
        return true;
    },

    /**
     * Sets the Range to contain the contents of a Node.
     * 
     * @see https://developer.mozilla.org/en/DOM/range.selectNodeContents
     * @param {HTMLElement} referenceNode
     * @return {Bool}
     */
    selectNodeContents : function(referenceNode) {
        this._range.moveToElementText(referenceNode);
        this._range.select();
        this._refresh();
        return true;
    },

    /**
     * Sets the start position of a Range.
     * 
     * @todo Currently, only one element can be within a range.
     *       Need to add ability to span multiple elements.
     * @see https://developer.mozilla.org/en/DOM/range.setStart
     * @param {HTMLElement} startNode
     * @param {Int} startOffset
     * @return {Bool}
     */
    setStart : function(startNode, startOffset) {
        var st;
        st = true;
        if (this.commonAncestorContainer === null) {
            st = this._selectNode(startNode);
        }
        if (st) {
            this._range.moveStart('character', startOffset);
            this._range.select();
            this._refresh();
        }
        else {
            this._reset();
        }
        return st;
    },

    /**
     * Sets the end position of a Range. 
     * 
     * @todo Currently, only one element can be within a range.
     *       Need to add ability to span multiple elements.
     * @see https://developer.mozilla.org/en/DOM/range.setEnd
     * @param {HTMLElement} endNode
     * @param {Int} endOffset
     * @return {Bool}
     */
    setEnd : function(endNode, endOffset) {
        var st, txtLen, offset;
        st = true;
        if (this.commonAncestorContainer === null) {
            st = this._selectNode(endNode);
        }
        if (st) {
            if (this._isTextNode(endNode)) {
                txtLen = endNode.length;
            }
            else {
                txtLen = endNode.innerText.length;
            }
            offset = -(txtLen - endOffset);
            this._range.moveEnd('character', offset);
            this._range.select();
            this._refresh();
        }
        else {
            this._reset();
        }
        return st;
    },

    /**
     * Collapses the Range to one of its boundary points.
     * 
     * @see https://developer.mozilla.org/en/DOM/range.collapse
     * @param {Bool} toStart
     * @return {Bool}
     */
    collapse : function(toStart) {
        this._range.collapse(toStart);
        this._refresh();
        return true;
    },

    /**
     * Sets the Range to contain the node and its contents.
     * 
     * @see https://developer.mozilla.org/en/DOM/range.insertNode
     * @param {HTMLElement} referenceNode
     * @return {Bool}
     */
    insertNode : function(referenceNode) {
        this.collapse(true);
        this._range.pasteHTML(referenceNode.outerHTML);
        this._refresh();
        return true;
    },

    /**
     * Releases Range from use to improve performance.
     * 
     * @see https://developer.mozilla.org/en/DOM/range.detach
     * @return {Bool}
     */
    detach : function() {
        delete this._range;
        this._reset();
        return true;
    },

    /**
     * Removes the contents of a Range from the document.
     * 
     * @see https://developer.mozilla.org/en/DOM/range.deleteContents
     * @return {Bool}
     */
    deleteContents : function() {
        window.document.execCommand('Delete');
        this._reset();
        return true;
    },

    /**
     * Returns the text of the Range 
     * 
     * @see https://developer.mozilla.org/en/DOM/range.toString
     * @return {String}
     */
    toString : function() {
        var ret;
        ret = this._range.text;
        return ret;
    },

    /**
     * Selects node
     * 
     * @param {HTMLElement} referenceNode
     * @return {Bool}
     */
    _selectNode : function(referenceNode) {
        if (this._isTextNode(referenceNode)) {
            return this._selectTextNode(referenceNode);
        }
        else {
            return this._selectElmNode(referenceNode);
        }
    },

    /**
     * Select Node helper for text node
     * 
     * @private
     * @param {HTMLElement} referenceNode
     * @return {Bool}
     */
    _selectTextNode : function(referenceNode) {
        var childs, i, _i, txtLen, totLen, starter, cnode, node;
        childs = this._bounder.childNodes;
        txtLen = 0;
        totLen = 0;
        cnode = null;
        node = null;
        for (i = 0, _i = childs.length; i < _i; i++) {
            cnode = childs[i];
            if (cnode === referenceNode) {
                node = cnode;
                break;
            }
            // Text Node
            if (this._isTextNode(cnode)) {
                txtLen = cnode.length;
            }
            // Elm Node
            else {
                txtLen = cnode.innerText.length;
            }
            totLen += txtLen;
        }
        if (node !== null) {
            if (this._isTextNode(node)) {
                endVal = totLen + node.length;
            }
            else {
                endVal = totLen + node.innerText.length;
            }
            this._range.moveToElementText(this._bounder);
            this._range.collapse(true);
            this._range.moveStart('character', totLen);
            this._range.moveEnd('character', endVal);
            return true;
        }
        else {
            this._range.moveStart('character', -10000000);
            this._range.moveEnd('character', -10000000);
            return false;
        }
    },

    /**
     * Select Node helper for non-text node
     * 
     * @private
     * @param {HTMLElement} referenceNode
     * @return {Bool}
     */
    _selectElmNode : function(referenceNode) {
        this._range.moveToElementText(referenceNode);
        this._range.moveStart('character', -1);
        this._range.moveEnd('character', 1);
        return true;
    },

    /**
     * Reset range properties to no data
     * 
     * @private
     * @return {Bool}
     */
    _reset : function() {
        this.commonAncestorContainer = null;
        this.endContainer = null;
        this.endOffset = 0;
        this.startContainer = null;
        this.endOffset = 0;
        return true;
    },

    /**
     * Populate range properties with relevent data
     * 
     * @private
     * @return {Bool}
     */
    _refresh : function() {
        container = this._getContainer();
        if (container === null) {
            this._reset();
        }
        else {
            this.commonAncestorContainer = container.node;
            this.endContainer = container.node;
            this.endContainer = container.offset;
            this.startContainer = container.node;
            this.startOffset = container.offset;
        }
        return true;
    },

    /**
     * Gets container for a range
     * 
     * @private
     * @return {Object[HTMLElement node, Int offset]|null}
     */
    _getContainer : function() {
        var parent, container;
        parent = this._range.parentElement();
        // Text Element
        if (parent === this._bounder) {
            container = this._getTextContainer();
        }
        // Node
        else {
            container = this._getNodeContainer();
        }
        return container;
    },

    /**
     * Gets container for a range having a non-text element
     * 
     * @private
     * @return {Object[HTMLElement node, Int offset]}
     */
    _getNodeContainer : function() {
        var node, offset;
        node = this._range.parentElement();
        offset = this._getElmOffset();
        return {
            node : node,
            offset : offset
        }
    },

    /**
     * Gets container for a range having a text element
     * 
     * @private
     * @return {Object[HTMLElement node, Int offset]|null}
     */
    _getTextContainer : function() {
        var cnode, node, i, txtLen, totLen, childs, absOffset;
        childs = this._bounder.childNodes;
        absOffset = this._getTextAbsOffset();
        totLen = 0;
        txtLen = 0;
        node = null;
        cnode = null;
        for (i = 0, _i = childs.length; i < _i; i++) {
            cnode = childs[i];
            // Text Node
            if (this._isTextNode(cnode)) {
                txtLen = cnode.length;
            }
            else {
                txtLen = cnode.innerText.length;
            }
            totLen += txtLen;
            if (totLen >= absOffset) {
                node = cnode;
                break;
            }
        }
        if (node !== null) {
            offset = (txtLen - (totLen - absOffset));
            return {
                node : node,
                offset : offset
            }
        }
        else {
            return null;
        }
    },

    /**
     * Determines if node is a text node
     * 
     * @private
     * @param {HTMLElement} node
     * @return {Bool}
     */
    _isTextNode : function(node) {
        return (node.nodeType === 3);
    },

    /**
     * Get relative offset index for a non-text node
     * 
     * @private
     * @return {Int}
     */
    _getElmOffset : function() {
        var r1, r2, s1, s2, offset;
        r1 = document.selection.createRange();
        r2 = document.selection.createRange();
        r1.moveToElementText(r1.parentElement());
        s1 = Math.abs(r1.moveStart('character', -100000000));
        s2 = Math.abs(r2.moveStart('character', -100000000));
        offset = s2 - s1;
        return offset;
    },

    /**
     * Get absolute offset for a text-node
     * 
     * @private
     * @return {Int}
     */
    _getTextAbsOffset : function() {
        var r1, r2, s1, s2, offset;
        r1 = document.selection.createRange();
        r2 = document.selection.createRange();
        r1.moveToElementText(this._bounder);
        s1 = Math.abs(r1.moveStart('character', -100000000));
        s2 = Math.abs(r2.moveStart('character', -100000000));
        offset = s2 - s1;
        return offset;
    },

    /**
     * Determines if an element is a child of or is equal to another element
     * 
     * @private
     * @param {HTMLElement|null} parent
     * @param {HTMLElement|null} child
     * @return {Bool}
     */
    _isChild : function(parent, child) {
        if (parent === null || child === null) {
            return false;
        }
        else if (parent === child) {
            return true;
        }
        else if (child === window.document.body ||
                 child === window.document) {
            return false;
        }
        else if (child.contains(parent)) {
            return false;
        }
        else {
            return parent.contains(child);
        }
    }

};

/**
 * Assign Selection object constructor
 */
if (window.getSelection === undefined) {
    window.getSelection = function() {
        return (new RangeIE.Selection);
    };
}

/**
 * Assign Range object constructor
 */
if (window.document.createRange === undefined) {
    window.document.createRange = function() {
        return (new RangeIE.Range);
    };
}

