// ==UserScript==
// @name         Fix Thingiverse Short Collection List - Part 1 - Accumulate Collection Names
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       Annoyed Thingiverse User
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @match        https://www.thingiverse.com/**/collections
// @grant        none
// ==/UserScript==

const KEY_PREFIX="thingiverse_collection_";
const FORCE_REPLACE=true;

/*
 * retrieves the id from the collection detail page using XHR, and stores an object
 * in localStorage as follows:
 * "
 */
function storeCollectionReferenceItem(valueObject) {

    // Set up to fetch (in the background) the page containing detailed collection information
    var xhrCollectionDetailPage = new XMLHttpRequest();
    // make valueObject available via "this.valueObject" in callbacks
    xhrCollectionDetailPage.valueObject = valueObject;
    // register a callback function that extracts the objectId once the collection detail page loads
    xhrCollectionDetailPage.onreadystatechange = function() {
        if (this.readyState == 4) {
            var hiddenElementForParsing = document.body.appendChild(document.createElement("div"));
            hiddenElementForParsing.style.display = "none";
            var bodyOnlyRegexp = /<body[^>]*>([\s\S]+)<\/body>/i;
            hiddenElementForParsing.innerHTML = this.responseText.match(bodyOnlyRegexp)[1];
            // Get the "like" link element which has the "data-id" attribute for the collection
            var detailPageLikeHrefElement = hiddenElementForParsing.querySelector("a[data-action='like'][data-type='collection'");
            // store that id value in the map instead of the placeholder "1234" below
            this.valueObject.dataId = detailPageLikeHrefElement.getAttribute("data-id");
            console.log("Storing collection info key: '" + KEY_PREFIX + this.valueObject.linkName +
                        "' :: linkName: '" + this.valueObject.linkName +
                        "' :: dataId '" + this.valueObject.dataId +
                        "' :: labelName: '" + this.valueObject.labelName + "'");
            localStorage.setItem(KEY_PREFIX + valueObject.linkName, JSON.stringify(valueObject));
        } else {
            // Use this to debug errors
            //console.log("readyState: " + this.readyState);
        }
    };
    console.log("Fetching data-id from: " + valueObject.collectionDetailPageLink);

    xhrCollectionDetailPage.open("GET", valueObject.collectionDetailPageLink); // this is async.  see callback.
    xhrCollectionDetailPage.send();
}

function findTheCollectionReferences() {
    var collectionsElements = document.querySelectorAll("a[class^='CollectionCardBody']");
    if (collectionsElements.length == 0) {
        console.log("no collection cards found on this page.  doing nothing.");
        return;
    }
    console.log("Found " + collectionsElements.length + " elements on this page");
    for (var i=0; i<collectionsElements.length; i++) {
        var hrefText = collectionsElements[i].getAttribute("href");
        var collectionNamePos = hrefText.indexOf("/collections/") + 13;
        var collectionLinkName = hrefText.substring(collectionNamePos);
        var previouslyStoredCollectionInfo = localStorage.getItem(KEY_PREFIX + collectionLinkName);
        if (!FORCE_REPLACE && previouslyStoredCollectionInfo) {
            console.log("Found previously stored info object for collection: '" + collectionLinkName + "'. Skipping dataId retrieval, etc.")
        } else {
            // Now get the readable name for the collection
            var collectionLabelNameNode = collectionsElements[i].parentElement.querySelector("span[class^='CollectionCardHeader__cardNameWrapper']");
            var collectionLabelName = collectionLabelNameNode.textContent;
            // console.log("header cardname element: " + collectionLabelNameNode);
            // console.log("Label name: " + collectionLabelName);
            var valueObject = {};
            valueObject.collectionDetailPageLink = hrefText; // used to fetch the collection object id
            valueObject.linkName = collectionLinkName; // used when building the "select" list
            valueObject.labelName = collectionLabelName; // used when building the "select" list
            storeCollectionReferenceItem(valueObject);
        }
    }
    const popupDiv = document.createElement("div");
    popupDiv.appendChild(document.createTextNode("Finished updating " + collectionsElements.length + " collection info items."));
    //popupDiv.setAttribute("style", "");
    document.getElementsByTagName("body")[0].appendChild(popupDiv);
    setTimeout(function(popupDiv) {
        console.log("TODO: find a way to hide the popup after a few seconds")
        // popupDiv.setAttribute("style", "hidden");
    },5000);
}

(function() {
    'use strict';
    // This gets invoked twice (once upon initial creation of the empty list, and again when the list gets filled)
    waitForKeyElements ("div[class^='UserCollections__collectionsList']", findTheCollectionReferences);
    // This gets invoked for each card that appears on the page
    // waitForKeyElements ("div[class^='CollectionCard__CollectionCard']", findTheCollectionReferences);


})();