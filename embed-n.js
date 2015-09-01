function duplicatePdfPanes(n_panes, start_page) {
  
  // HANDLE FUNCTION PARAMETERS
  
  if (isNaN(parseInt(n_panes))) {
    // default to making 2 panes
    var n_panes = 2;
  }
  
  if (n_panes > 5) {
    throw("Maybe let's not crash the browser...");
  }
  
  // I doubt you'd ever want to but make it possible to start viewing a few pages into the PDF
  if (isNaN(parseInt(start_page, 10))) {
    var start_page = parseInt(1, 10);
  }
  // Tried to check if defined and throw an error but Javascript doesn't register
  
  // First rule of PDF <embed> duplication club is we don't duplicate PDF <embed> recursively
  if (document.querySelectorAll('embed').length !== 1) {
    throw("I can't let you do that Dave...\n\n\
    Refresh the page to specify new panes, or use incrementPages() with the existing ones");
  }
  
  var original_pane = document.querySelector('embed');
  var pane_width = parseFloat(parseInt(100/n_panes * 1000, 10)/1000);
  var pane_width_str = String(pane_width) + "%";
  original_pane.setAttribute('width', pane_width_str);
  var pane_width_counter = parseFloat(0); // this will keep track of the width of any panes already on the page
  original_pane.style.position = 'absolute';
  original_pane.setAttribute('src', original_pane.getAttribute('src') + '#page=' + String(start_page));
  original_pane.remove();
  for (var j=0; j < n_panes; j++) {
    var duplicate_pane = original_pane.cloneNode();
    var dup_pane_match = duplicate_pane.getAttribute('src')
                                       .match('(.+\.pdf#page=)([0-9]+)$');
    var dup_pane_preURL = dup_pane_match[1];
    // Increment the page number by the position of current pane in the pane list
    var dup_pagenum = String(parseInt(dup_pane_match[2], 10) + j);
    
    // Fix tiny float undersizing
    if (n_panes == 3 && j == 2) pane_width_counter += 0.001;
    
    duplicate_pane.setAttribute('src', dup_pane_preURL + dup_pagenum);
    duplicate_pane.style.left = String(pane_width_counter) + '%';
    document.body.appendChild(duplicate_pane);
    
    pane_width_counter += pane_width; // increment by 1 width
  }
}

// incrementPage is a helper function to progress a PDF-containing
// <embed> element by 1 page, using the URI hash, `#page={pagenumber}`

// It is executed within a loop through an array of multiple such elements, each corresponding to a 'view'
// such that for example wide screens could view PDFs '3-up', smaller screens '2-up'

// It is called upon generating the pdf <embed> panes

function incrementPage(pdf_embed, embed_num, pdf_headcount) {
  var next_pdf = pdf_embed.cloneNode();
  src = next_pdf.getAttribute('src');
  pagematch = src.match('(.+\.pdf)#page=([0-9]+)$');
  if (pagematch === null) {
    // Huh ? The <embed> src attribute isn't a URL ending in ".pdf" ?
    throw("This doesn't appear to be a PDF... or at least one I can work with ! Sorry :-(");
  }
  var pdf_root = pagematch[1];
  var modnum = parseInt(pagematch[2], 10) + parseInt(pdf_headcount, 10); // Increment by total number of PDFs
  next_pdf.setAttribute('src',
                          pdf_root + '#page=' + modnum);

  // If Chrome followed the HTML5 spec this wouldn't be necessary!
  // But it doesn't, so remove the <embed> element and reinsert in order to reload to new src
  embed_body = document.body;
  embed_body.insertBefore(next_pdf, pdf_embed);
  // To show the new pages, fade out the masking PDF embed and delete it on a timer,
  // optionally also tying this fade/deletion to an 'onload' event... if possible?
}

function incrementPages() {
  var pdf_embeds = document.querySelectorAll('embed');
  var embed_count = pdf_embeds.length;
  for (var i=0; i<pdf_embeds.length; i++) {
    var embed_num = i + 1; // 1-based index
    var pdf_embed = pdf_embeds[i];
    incrementPage(pdf_embed, i, embed_count);
  }
  refocus();
}

function decrementPages() {
  // TODO: allow decreasing of pages, the minimum being the start_page
  //       i.e. if the first pdf_embed in the list decrements to below 1,
  //       then to all pages add the difference between that first page and 1
/*
var pdf_embeds = document.querySelectorAll('embed');
  var embed_count = pdf_embeds.length;
  for (var i=0; i<pdf_embeds.length; i++) {
    var embed_num = i + 1; // 1-based index
    var pdf_embed = pdf_embeds[i];
    incrementPage(pdf_embed, i, embed_count);
  }
*/

 // refocus();
}

function initialisePdfViewer() {
  duplicatePdfPanes();
  // then tie functions to the window:
  window.onkeydown = checkKey;
  //   incrementPages (to the right arrow key press/space/vim-right-key)
  //   TODO: a decrementPages function (to the left arrow key press/vim-left-key)
  // ... but this would need to check that the first page's page number would not go below 1
  
  refocus();
}

// Function to return focus to a DOM element, so that key presses register
function refocus() {
  document.querySelector('embed').focus();
}

// Tying functions to page: outline of method below:

function checkKey(e) {
  e = e || window.event;
  // check general conditions of running
  if (e.keyCode == '37') {
    // left arrow response (decrementPages)
  } else if (e.keyCode == '39') {
    incrementPages()
    return false;
  }
}

// Run initialisation function:

initialisePdfViewer()
