This repository actually contains two separate projects which should probably be in two distinct repositories. One project is CIP.js, a library for communicating with CIP endpoints, as defined in [this](http://samlinger.natmus.dk/CIP/doc/index.html) document.

As an app developer you probably don't want to clone this repository. Rather, you'd want a build of it, preferably one that includes the documentation too. However, since this project is still under active development no builds are available, so you would have to do it yourself anyway, see the section below on build instructions.

CIP.js
======
Cumulus CIP is an asset management system used by a variety of (Danish?) institutions. CIP.js provides a convenient object-relation layer on top of the CIP infrastructure to make it easier to make various operations on the collections exposed by CIP. CIP.js is read-only (currently).

For CIP-technical reasons, CIP.js requires some non-standard CIP setup and a 'handle' for that particular setup.

The library uses [qwest](https://github.com/pyrsmk/qwest) for keeping track of the AJAX connections. qwest is already included in CIP.js and uses the MIT license.

Writing CIP.js handles
----------------------
TODO

NatMus.js
=========
NatMus.js provides a 'handle' for CIP.js that provides access to the collections of the National Museum of Denmark.


Build instructions
==================
Make sure you have [Google's Closure Compiler](https://developers.google.com/closure/compiler/), [Node.js](http://nodejs.org/) and [JSDoc](http://usejsdoc.org/) installed before proceeding.

1.  Clone this repository.
2.  Review `build.sh` and change the path to `jsdoc.js` to one that matches your system.
3.  Run `build.sh`.


Contact
=======
This project is primarily maintained by [@jchillerup](https://github.com/jchillerup) for [BIT BLUEPRINT](http://www.bitblueprint.com/).

The BIT BLUEPRINT team is available by email or live by IRC on [#bitblueprint at irc.freenode.net](http://webchat.freenode.net/?channels=bitblueprint).
