As an app developer you probably don't want to clone this repository. Rather, you'd want a build of it, preferably one that includes the documentation too. However, since this project is still under active development no builds are available, so you would have to do it yourself anyway, see the section below on build instructions.

# cip.js
CIP is an interface web service to an asset management system, called Cumulus, which used by a variety of institutions. Read more about CIP and Cumulus on http://www.canto.com/what-we-offer/.

cip.js provides a convenient object-relation layer on top of the CIP infrastructure to make it easier to make various operations on the collections exposed by CIP. cip.js does only supports read-only for the momemt.

The library uses [qwest](https://github.com/pyrsmk/qwest) for keeping track of the AJAX connections. qwest is already included in cip.js and uses the MIT license.

## Writing cip.js handles

For every institution which exposes a CIP to the internet, the cip.js library needs some institution-specific setup and a 'handle' for that particular setup.

### NatMus.js
If you are looking for one such institution-specific setup, [natmus.js](https://github.com/NationalMuseumofDenmark/natmus.js) provides a 'handle' for cip.js that allows access to the collections of the National Museum of Denmark.

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
