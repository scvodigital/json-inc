# JSON inc.
A rudimentary JSON transpiler CLI that allows JSON files to be split up.

## WARNING!
This is a part of an ever evolving internal tool chain and although I'm 
going to try not to change the way it works too much, there may be 
compatability issues when this eventually gets tidied up and updated.

## Purpose
The purpose of this tool is to assist with large JSON configuration files
that need to contain huge strings or have bits of JSON that can be logically
broken out into their own thing. On top of this, we wanted the JSON inc. 
files to be valid JSON to keep our code editors happy and to allow for 
scripted transformations.

## Installation
Installation is pretty simple

```
npm i -g @scvo/json-inc
```

## Syntax
There are 4 basic things that can be done using JSON inc.

### Include file contents as strings
Include the contents of an external file as a JSON safe string. Check out 
this example:

**routes.json2:**
```
{
    "test_route": {
        "pattern": "/test-route",
        "html": "{$./html/test-route.html}"
    }
}
```

**./html/test-route.html:**
```
<html>
    <head>
        <title>Test Route</title>
    </head>
    <body>
        <h1>I'm a big ol' HTML file</h1>
        <p>I'd otherwise be annoying to include in a JSON file</p>
    </body>
</html>
```

If you were to run `routes.json2` through JSON inc. you'd get the following 
output:

```
{
    "test_route": {
        "pattern": "/test-route",
        "html": "<html>\n    <head>\n        <title>Test Route</title>\n    </head>\n    <body>\n        <h1>I\'m a big ol\' HTML file</h1>\n        <p>I\'d otherwise be annoying to include in a JSON file</p>\n    </body>\n</html>\n"
    }
}
```

### Include entire JSON files as values
Include a complete external JSON file as the value of a property in 
your JSON inc. file. Check out this example:

**routes.json2:**
```
{
    "test_route": "{:./routes/test-route.json}"
}
```

**./routes/test-route.json:**
```
{
    "pattern": "/test-route",
    "html": "<html>...</html>"
}
```

If you were to run `routes.json2` through JSON inc. you'd get the following
output:

```
{
    "test_route": {
        "pattern": "/test-route",
        "html": "<html>...</html>"
    }
}
```

### Include parts of JSON files as values
Include specific bits of an external JSON file as the value of a property
in your JSON inc. file. Check out this example:

**site.json2:**
```
{
    "routes": {
        "test_route": "{:./routes.json@test_route}"
    }
}
```

**./routes.json:**
```
{
    "test_route": {
        "pattern": "/test-route",
        "html": "<html>...</html>"
    }
}
```

If you were to run `site.json2` through JSON inc. you'd get the following
output:

```
{
    "routes:" {
        "test_route": {
            "pattern": "/test-route",
            "html": "<html>...</html>"
        }
    }
}
```

### Include parts of a JSON file as part of your current JSON file
As you may have noticed. We are just including stuff into the values of
JSON properties. This is limiting because we might want to include an array
or just split up a larger object from an external file.

This has a slightly messier syntax as we still want to keep our JSON. inc
files as valid JSON. Here's an example:

**site.json2:**
```
{
    "routes": {
        "index": {
            "pattern": "/",
            "html": "<html>...</html>"
        },
        "{:./other-routes.json}": ""
    }
}
```

**./other-routes.json:**
```
{
    "test_route": {
        "pattern": "/test-route",
        "html": "<html>...</html>"
    },
    "another_route": {
        "pattern": "/another-route",
        "html": "<html>...</html>"
    }
}
```

Run this through JSON inc. And you'll get the following:
```
{
    "routes": {
        "index": {
            "pattern": "/",
            "html": "<html>...</html>"
        },
        "test_route": {
            "pattern": "/test-route",
            "html": "<html>...</html>"
        },
        "another_route": {
            "pattern": "/another-route",
            "html": "<html>...</html>"
        }
    }
}
```

This works with arrays too and you can also do the `@` trick to point to
a specific path inside the external JSON file e.g:

```
{
    "routes": {
        "index": {
            "pattern": "/",
            "html": "<html>...</html>"
        },
        "{:./other-routes.json@path.to.routes}": ""
    }
}
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
