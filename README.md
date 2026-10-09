# 🧾 JSON error messages, captured from real parsers

The exact error text that **11 runtimes** print when `JSON.parse` / `json.loads` fails, for **18 common kinds of broken JSON**. Every message was produced by running the input through the real parser, not copied from docs or memory.

> **Runtimes:** Chrome 151 · Firefox 153 · Safari 26 (WebKit) · Node 24 · Node 22 · Node 20 · Node 18 · Bun · Python 3.13 · Python 3.12 · Python 3.10
>
> **Captured:** 2026-10-09 · **Rows:** 198

It's the data behind [JSON Error Messages, Decoded](https://smartjson.io/errors/) on SmartJson, where each error has a page that explains the cause and the fix.

---

## 🔍 Why it's useful

The same mistake reads completely differently depending on where it happens. A trailing comma, `{"name": "Ada", "age": 36,}`:

| Runtime | Message |
|---|---|
| Chrome 151 | `Expected double-quoted property name in JSON at position 26 (line 1 column 27)` |
| Firefox 153 | `JSON.parse: expected double-quoted property name at line 1 column 27 of the JSON data` |
| Safari 26 (WebKit) | `JSON Parse error: Property name must be a string literal` |
| Node 24 | `Expected double-quoted property name in JSON at position 26 (line 1 column 27)` |
| Node 22 | `Expected double-quoted property name in JSON at position 26 (line 1 column 27)` |
| Node 20 | `Expected double-quoted property name in JSON at position 26` |
| Node 18 | `Unexpected token } in JSON at position 26` |
| Bun | `JSON Parse error: Property name must be a string literal` |
| Python 3.13 | `JSONDecodeError: Illegal trailing comma before end of object: line 1 column 26 (char 25)` |
| Python 3.12 | `JSONDecodeError: Expecting property name enclosed in double quotes: line 1 column 27 (char 26)` |
| Python 3.10 | `JSONDecodeError: Expecting property name enclosed in double quotes: line 1 column 27 (char 26)` |

If you search for the message your user reported, this dataset tells you which runtime wrote it and which input causes it.

---

## 📦 Files

| File | What's in it |
|---|---|
| [`data/messages.json`](data/messages.json) | `{captured, inputs, runtimes: [{id, label, engine, version, messages: {inputId: message}}]}`. A `null` message means the runtime **accepted** the input |
| [`data/messages.csv`](data/messages.csv) | One row per input and runtime: `input_id, input, runtime, engine, version, message`. An empty message means the input was accepted |
| [`capture/`](capture/) | The script that produced both files |

---

## 🧪 The inputs

| Id | Input | Explained on |
|---|---|---|
| `html-instead-of-json` | `<!DOCTYPE html><html><body>Not Found</body></html>` | [html-instead-of-json](https://smartjson.io/errors/html-instead-of-json/) |
| `empty-body` | *(empty string)* | [unexpected-end-of-json-input](https://smartjson.io/errors/unexpected-end-of-json-input/) |
| `trailing-comma` | `{"name": "Ada", "age": 36,}` | [trailing-comma](https://smartjson.io/errors/trailing-comma/) |
| `single-quotes` | `{'name': 'Ada'}` | [single-quotes](https://smartjson.io/errors/single-quotes/) |
| `unquoted-key` | `{name: "Ada"}` | unquoted-keys (page out 10/10) |
| `comment` | `{"a": 1 // note\n}` | comments-in-json (page out 10/13) |
| `nan` | `{"score": NaN}` | nan-infinity (page out 10/17) |
| `truncated` | `{"items": [1, 2` | [unexpected-end-of-json-input](https://smartjson.io/errors/unexpected-end-of-json-input/) |
| `bom` | `\uFEFF{"a": 1}` | utf8-bom (page out 10/17) |
| `python-repr` | `{'ok': True, 'value': None}` | [single-quotes](https://smartjson.io/errors/single-quotes/) |
| `two-documents` | `{"a": 1}\n{"b": 2}` | [extra-data](https://smartjson.io/errors/extra-data/) |
| `raw-newline-in-string` | `{"text": "line one\nline two"}` | bad-control-character (page out 10/15) |
| `undefined` | `{"a": undefined}` | undefined-is-not-valid-json (page out 10/10) |
| `missing-comma` | `{"a": 1 "b": 2}` | missing-comma (page out 10/13) |
| `object-object` | `[object Object]` | [object-object-is-not-valid-json](https://smartjson.io/errors/object-object-is-not-valid-json/) |
| `bad-escape` | `{"path": "C:\Users\ada"}` | bad-escape (page out 10/15) |
| `undefined-text` | `undefined` | undefined-is-not-valid-json (page out 10/10) |
| `infinity` | `{"limit": Infinity}` | nan-infinity (page out 10/17) |

`\uFEFF` is the invisible byte order mark; `\n` is a real line break inside the input.

---

## 🔁 Reproduce it

```sh
sh capture/run.sh
```

It needs Docker and nothing else. Each runtime runs in its official image (`node:*-alpine`, `oven/bun:alpine`, `python:*-alpine`, and Playwright's image for Chromium, Firefox and WebKit), one container at a time with a memory cap. It rewrites both files in `data/`.

**Notes:**

- **Safari** is WebKit as shipped by Playwright, not Safari on a Mac. Its messages match JavaScriptCore's, which is also Bun's engine.
- **Python** messages are prefixed with `JSONDecodeError:`, as your traceback shows them.
- **Adding an input** is a new line in `capture/inputs.json`, then a re-run.

---

## 📄 License

- **Data** (`data/`): [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Credit "SmartJson, smartjson.io/errors".
- **Code** (`capture/`): [MIT](LICENSE).

Found a runtime that says something different? [Open an issue](../../issues) with the runtime, its version and the input.
