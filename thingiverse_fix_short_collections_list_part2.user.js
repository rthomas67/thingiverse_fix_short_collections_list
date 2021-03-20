// ==UserScript==
// @name         Fix Thingiverse Short Collection List - Part 2 - Add the Options
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       Annoyed Thingiverse User
// @require      http://cdn.thingiverse.com/site/js/jquery-3.2.1.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @match        https://www.thingiverse.com/thing:*
// @grant        none
// ==/UserScript==

const KEY_PREFIX = "thingiverse_collection_";
/*
 * This gets called whenever the "Select a Collection" pane/window pops up and
 * modifies the list using the collection info objects stored by the other
 * script.
 */
function completeTheCollectionSelectionList() {
    // Find the lists and make them what they should be anyway, except for MakerBot breaking existing users with more than 20 collections.
    var collectionsSelectElements = document.querySelectorAll("select[class^='CollectThingWindow']");

    console.log("Found " + collectionsSelectElements.length + " elements on this page");
    if (collectionsSelectElements.length > 0) {
        // Make an array of only the collectionInfoObjects that are in localStorage
        var collectionInfoObjects = [];
        for (const localStorageKey in localStorage) {
            if (localStorageKey.startsWith(KEY_PREFIX)) {
                collectionInfoObjects[collectionInfoObjects.length] = JSON.parse(localStorage.getItem(localStorageKey));
                // console.log("CHECK :: " + collectionInfoObjects[collectionInfoObjects.length-1].labelName);
            }
        }
        // stuff the extra elements in any of the select lists found on the page.
        for (var i=0; i<collectionsSelectElements.length; i++) {
            const selectElement = collectionsSelectElements[i];
            for (var collectionInfoObject of collectionInfoObjects) {
                // This is a little hacky, but maybe quicker than using querySelector()
                var optionAlreadyExists = (selectElement.innerHTML.indexOf('value="' + collectionInfoObject.dataId + '"') > -1);
                // This should also work but might be a bit slower.  TODO: Compare w/ string search of innerHTML above
                // var optionAlreadyExists = selectElement.querySelector('[value="' + collectionInfoObject.dataId + '"]');
                if (!optionAlreadyExists) {
                    // Add an option for anything that is in the Map but not in the select.
                    var missingOption = document.createElement('option');
                    missingOption.value = collectionInfoObject.dataId;
                    missingOption.innerHTML = collectionInfoObject.labelName;
                    selectElement.appendChild(missingOption);
                }
            }
        }
    }
}

(function() {
    'use strict';
    waitForKeyElements ("select[class^='CollectThingWindow']", completeTheCollectionSelectionList);

})();