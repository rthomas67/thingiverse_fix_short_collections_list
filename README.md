# Summary
Two user scripts for Greasemonkey or Tampermonkey in a browser
that cooperate to "fix" the list of collections in Thingiverse
where, after many people already had more than 20 collections,
MakerBot decided to limit the number of options in the
"Select a Collection" drop down list to 20.

# What it does.
* Part 1 captures the collection information on your "collections"
page and stuff the info into the browser's localStorage.
  * With this script installed, navigate through all pages of
  collections.  Open up developerTools to see what's happening
  if you want.  Everything is console.log()'d
* Part 2 modifies the list of options in the select dropdowns
when they appear on a page.
  * With this script installed, go to a page where you have
  the option of adding something to a collection, and
  you should have your full list of more than 20
  choices.
