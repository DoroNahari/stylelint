const
  test = require("stylelint-test-rule-tape"),
  rule = require(".."),
  ruleName = rule.ruleName;

test(rule.rule, {
  ruleName,
  config: null,
  accept: [
    {
      code: `
      .sapM1 .sapM2 .foo {
        font-size: 11px;
        margin-top: 12px;
      }
    `},
    {
      code: `
      .sapM1 .sapM2 .foo, .sapM1 .sapM2 .foo {
        font-size: 11px;
        margin-top: 12px;
      }
    `},
  ],
  // rejections
  reject: [
    {
      code: `
      .sapM1 .sapM2  {
        font-size: 11px;
        margin-top: 12px;
      }`,
      message: `Unexpected rule "body" inside at-rule "include". (${ruleName})`,
    },
    {
        code: `
      .sapM1 .sapM2 .foo, .sapM1 .sapM2  {
        font-size: 11px;
        margin-top: 12px;
      }`,
        message: `Unexpected rule "body" inside at-rule "include". (${ruleName})`,
    },
  ],
});

// test for all at rules
// list from https://developer.mozilla.org/en/docs/Web/CSS/At-rule
test(rule.rule, {
  ruleName,
  config: null,
  accept: [
    { code: `@charset "iso-8859-15";` },
    { code: `
      @keyframes identifier {
        0% { top: 0; left: 0; }
        30% { top: 50px; }
        68%, 72% { left: 50px; }
        100% { top: 100px; left: 100%; }
      }
    `},
    {
      code: `
      @import url("fineprint.css") print;
      @import url("bluish.css") projection, tv;
      @import 'custom.css';
      @import url("chrome://communicator/skin/");
      @import "common.css" screen, projection;
      @import url('landscape.css') screen and (orientation:landscape);
    `},
    {
      code: `
      @namespace prefix url(XML-namespace-URL);
      @namespace prefix "XML-namespace-URL";
    `},
    {
      code: `
      body {
        @supports (--foo: green) {
          color: green;
        }
      }
    `},
    {
      code: `
      body {
        @document url(http://www.w3.org/),
                       url-prefix(http://www.w3.org/Style/),
                       domain(mozilla.org),
                       regexp("https:.*")
        {
          color: purple;
          background: yellow;
        }
      }
    `},
    {
      code: `
      @font-face {
        font-family: MyHelvetica;
        src: local("Helvetica Neue Bold"),
        local("HelveticaNeue-Bold"),
        url(MgOpenModernaBold.ttf);
        font-weight: bold;
      }
    `},
    {
      code: `
      @viewport {
        zoom: 0.75;
        min-zoom: 0.5;
        max-zoom: 0.9;
      }
    `},
    {
      code: `
      @counter-style circled-alpha {
        system: fixed;
        symbols: Ⓐ Ⓑ Ⓒ Ⓓ Ⓔ Ⓕ Ⓖ Ⓗ Ⓘ Ⓙ Ⓚ Ⓛ Ⓜ Ⓝ Ⓞ Ⓟ Ⓠ Ⓡ Ⓢ Ⓣ Ⓤ Ⓥ Ⓦ Ⓧ Ⓨ Ⓩ;
        suffix: " ";
      }
    `},
  ],

  reject: [
    {
      code: `
      @supports (--foo: green) {
        body {
          color: green;
        }
      }
    `},
    {
      code: `
      @document url(http://www.w3.org/),
                     url-prefix(http://www.w3.org/Style/),
                     domain(mozilla.org),
                     regexp("https:.*")
      {
        body {
          color: purple;
          background: yellow;
        }
      }
    `},
  ],
});

test(rule.rule, {
  ruleName,
  config: [{ ignore: ["foo", "baz"] }],
  accept: [
    {
      code: `
      @foo () {
        body {
          display: block;
        }
      }
    `},
    {
      code: `
      @include foo() {
        body {
          display: block;
        }
      }
    `},
  ],
  reject: [
    {
      code: `
      @include bar() {
        body {
          display: block;
        }
      }
    `},
    {
      code: `
      $boolean: true;
      @if ($boolean) {
        body { display: block }
      } else {
        body { display: flex }
      }
    `},
  ],
});

test(rule.rule, {
  ruleName,
  config: [{ ignore: ["if"] }],
  accept: [
    {
      code: `
      $boolean: true;
      @if ($boolean) {
        body { display: block }
      } else {
        body { display: flex }
      }
    `},
  ],
});
