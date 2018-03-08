# json-inc
A rudimentary JSON transpiler CLI that allows JSON files to be split up

## WARNING!
This is a part of an ever evolving internal tool chain and although I'm 
going to try not to change the way it works too much, there may be 
compatability issues when this eventually gets tidied up and updated.

## Installation
Installation is pretty simple

```
npm i -g @scvo/json-inc
```

## Usage
This tool requires a minimum of 2 arguments:
* a space separated array of globs for input files; and
* an output path to where the resulting JSON file or files should go.
All input files should have the extension `.json2`.

### Examples
The following example with take all files with the extension `.json2` in the 
`./db-src` directory, process them, and save each file using its existing 
filename to the `./db-dst` directors (creating it if it doesn't exist), 
changing the file extensions to `.json`:

```
json-inc ./db-src/**/*.json2 ./db-dst
```

The next example does the same as the previous one but also processes a 
specific additional file `./db.json2`. They all still get output to the 
`.db-dst` directors:

```
json-inc ./db-src1/**/*.json2 ./db.json2 ./db-dst
```

As you can see, the last argument is always treated as the output directory

## TODO
* Create unit tests
* Support recursion
* Some actual error handling
* Rewrite all terribly hacky code (basically do it again but better)
