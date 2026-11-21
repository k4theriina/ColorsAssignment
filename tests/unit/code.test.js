/**
 * Front-end unit tests for public/js/code.js.
 * Runs in a simulated browser (jsdom); no server or database needed.
 *
 * @jest-environment jsdom
 */

const {
  validateColorName,
  formatColorList,
  addColor,
  searchColor,
} = require("../../public/js/code.js");

describe("validateColorName", () => {
  test("accepts a normal color name", () => {
    expect(validateColorName("Blue")).toBe("");
  });

  test("accepts a name with surrounding whitespace", () => {
    expect(validateColorName("  Sea Green  ")).toBe("");
  });

  test.each(["", "   ", null, undefined, 42])("rejects empty or non-string input (%p)", (input) => {
    expect(validateColorName(input)).toBe("Please enter a color name");
  });

  test("rejects names longer than 50 characters", () => {
    expect(validateColorName("a".repeat(51))).toBe("Color name must be 50 characters or fewer");
  });

  test("accepts a name of exactly 50 characters", () => {
    expect(validateColorName("a".repeat(50))).toBe("");
  });
});

describe("formatColorList", () => {
  test("joins multiple colors with line breaks", () => {
    expect(formatColorList(["Red", "Green", "Blue"])).toBe("Red<br />\r\nGreen<br />\r\nBlue");
  });

  test("returns a single color without a trailing break", () => {
    expect(formatColorList(["Red"])).toBe("Red");
  });

  test("returns an empty string for an empty list", () => {
    expect(formatColorList([])).toBe("");
  });

  test("returns an empty string when results are missing (API error response)", () => {
    expect(formatColorList(undefined)).toBe("");
  });
});

// Minimal fake XMLHttpRequest so we can inspect what the page would send to the API.
function installFakeXhr(responseText) {
  const sent = [];
  class FakeXhr {
    open(method, url) {
      this.method = method;
      this.url = url;
    }
    setRequestHeader() {}
    send(body) {
      sent.push({ method: this.method, url: this.url, body: JSON.parse(body) });
      this.readyState = 4;
      this.status = 200;
      this.responseText = responseText;
      this.onreadystatechange();
    }
  }
  global.XMLHttpRequest = FakeXhr;
  return sent;
}

describe("addColor (form handling)", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <input id="colorText" />
      <span id="colorAddResult"></span>`;
  });

  test("shows a validation message and does not call the API for an empty color", () => {
    const sent = installFakeXhr('{"error":""}');
    document.getElementById("colorText").value = "   ";

    addColor();

    expect(sent).toHaveLength(0);
    expect(document.getElementById("colorAddResult").innerHTML).toBe("Please enter a color name");
  });

  test("POSTs a trimmed color to AddColor.php and reports success", () => {
    const sent = installFakeXhr('{"error":""}');
    document.getElementById("colorText").value = "  Teal ";

    addColor();

    expect(sent).toHaveLength(1);
    expect(sent[0].method).toBe("POST");
    expect(sent[0].url).toBe("/LAMPAPI/AddColor.php");
    expect(sent[0].body).toEqual({ color: "Teal", userId: expect.any(Number) });
    expect(document.getElementById("colorAddResult").innerHTML).toBe("Color has been added");
  });
});

describe("searchColor (rendering results)", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <input id="searchText" />
      <span id="colorSearchResult"></span>
      <p id="colorList"></p>`;
  });

  test("renders each returned color on its own line", () => {
    const sent = installFakeXhr('{"results":["Red","Dark Red"],"error":""}');
    document.getElementById("searchText").value = "Red";

    searchColor();

    expect(sent[0].url).toBe("/LAMPAPI/SearchColors.php");
    expect(sent[0].body.search).toBe("Red");
    expect(document.getElementById("colorList").innerHTML).toBe("Red<br>\nDark Red");
  });
});
