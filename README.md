# embed-n.js

### Basic proof-of-concept controlling embedded PDFs in the DOM, noting a long-term issue in Chromium

Fun little Javascript program to view PDFs "n-up" in the browser

Silly idea to view PDFs "n-up" in the browser, and tie the arrow keys to functions that page through [n at a time], but highlights a bug Chromium devs haven't addressed since 2011:

[**Issue 69648:	Cannot dynamically change embed src**](https://code.google.com/p/chromium/issues/detail?id=69648)

The issue was raised over Flash, which is currently [dying a death](http://www.wired.com/2015/08/google-flash-ads/), however PDFs are widely used and subject to the same restrictions. Modifying a `src` attribute on an `<embed src="http://www.somesite.com/document.pdf">` will not reload the file, thus navigation (with the PDF `#page=` hash) is prevented, along with [the other available PDF parameters](https://tools.ietf.org/html/rfc3778#section-3) specified with fragment identifiers:

* `nameddest=<name>`
* `#zoom=<scale>,<left>,<top>`
* `#view=<keyword>,<position>`
* `#viewrect=<left>,<top>,<wd>,<ht>`
* `#highlight=<lt>,<rt>,<top>,<btm>`
* `#search=`

If Chrome steps in line w/ the HTML5 spec, specifically : 

> Whenever an embed element that was not potentially active becomes potentially active, and whenever a potentially active embed element's src attribute is set, changed, or removed, and whenever a potentially active embed element's type attribute is set, changed, or removed, the appropriate set of steps from the following is then applied:

> **If the element has a src attribute set**

> The user agent must resolve the value of the element's src attribute, relative to the element. If that is successful, the user agent should fetch the resulting absolute URL, from the element's browsing context scope origin if it has one. The task that is queued by the networking task source once the resource has been fetched must find and instantiate an appropriate plugin based on the content's type, and hand that plugin the content of the resource, replacing any previously instantiated plugin for the element.

I'd think it could work without such disruptive 'reloading' (the `<embed>` element must currently be cloned/removed/reinstated). Hash navigation (e.g. `#page=…`) doesn't reload resources.

I'm not quite sure where Chrome's at with out-of-process PDF viewers etc [[due in Chrome 45?](https://bitbucket.org/chromiumembedded/cef/issues/1565/re-implement-pdf-viewer-using-out-of#comment-20427478)], maybe this will make this all obsolete :eyes:
