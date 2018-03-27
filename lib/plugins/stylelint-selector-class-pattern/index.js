"use strict";

const stylelint = require("stylelint");
const ruleName = "plugins/selector-class-pattern";
const isKeyframeSelector = require("../../utils/isKeyframeSelector");
const isStandardSyntaxRule = require("../../utils/isStandardSyntaxRule");
const isStandardSyntaxSelector = require("../../utils/isStandardSyntaxSelector");
const parseSelector = require("../../utils/parseSelector");
const report = require("../../utils/report");
const ruleMessages = require("../../utils/ruleMessages");
const validateOptions = require("../../utils/validateOptions");
const _ = require("lodash");
const resolveNestedSelector = require("postcss-resolve-nested-selector");
const styleSearch = require("style-search");
var j=0,flag,sValue,sIndex;

const messages = ruleMessages(ruleName, {
  expected: selectorValue => `Expected class selector ".${selectorValue}" to match specified pattern`,
});

const rule = function(primaryOption) {
  return function(root, result) {
    var validOptions = stylelint.utils.validateOptions({
      ruleName: ruleName,
      result: result,
      actual: primaryOption,
    });

    if (!validOptions) {
      return;
    }

    const params = new RegExp(`^(?!sapUi|sapM).*$`);

    const shouldResolveNestedSelectors = _.get(primaryOption, "resolveNestedSelectors");
    const normalizedPattern = _.isString(params) ? new RegExp(params) : params;

    root.walkRules(rule => {
      const selector = rule.selector;
      const selectors = rule.selectors;
      var afterCommaSelector;
      styleSearch(
        {
          source: selector,
          target: ",",
          functionArguments: "skip"
        },
        match => {
          afterCommaSelector = selector.substr(
              match.endIndex,
              selector.length - match.endIndex
          );
         // console.log("afterCommaSelector");
         // console.log(afterCommaSelector);
      parseSelector(afterCommaSelector, result, rule, s => checkSelector(s, rule));
  });

      if (!isStandardSyntaxRule(rule)) {
        return;
      }
      if (!isStandardSyntaxSelector(selector)) {
        return;
      }
      if (selectors.some(s => isKeyframeSelector(s))) {
        return;
      }

      // Only bother resolving selectors that have an interpolating &
      if (shouldResolveNestedSelectors && hasInterpolatingAmpersand(selector)) {
        resolveNestedSelector(selector, rule).forEach(selector => {
          if (!isStandardSyntaxSelector(selector)) {
            return;
          }
          parseSelector(selector, result, rule, s => checkSelector(s, rule));
        });
      } else {
          parseSelector(selector, result, rule, s => checkSelector(s, rule));
      }
    });

      function checkSelector(fullSelector, rule) {
          flag = 0;
          fullSelector.walkClasses(selectorNode => {
              if (flag == 1){
                    return;
              }
              sValue = selectorNode.value
          console.log(selectorNode.value)
              sIndex = selectorNode.sourceIndex
              if (normalizedPattern.test(sValue)) {
                  flag = 1
                  return
              }
              // report({
              //     result,
              //     ruleName,
              //     message: messages.expected(selectorNode.value),
              //     node: rule,
              //     index: selectorNode.sourceIndex,
              // })
          });
          if (flag == 0) {
              report({
                  result,
                  ruleName,
                  message: "sapM or sapUi override",
                  node: rule,
                  index: sIndex,
              })
          }
      }

  };
};

// An "interpolating ampersand" means an "&" used to interpolate
// within another simple selector, rather than an "&" that
// stands on its own as a simple selector
function hasInterpolatingAmpersand(selector) {
  for (let i = 0, l = selector.length; i < l; i++) {
    if (selector[i] !== "&") {
      continue
    }
    if (!_.isUndefined(selector[i - 1]) && !isCombinator(selector[i - 1])) {
      return true
    }
    if (!_.isUndefined(selector[i + 1]) && !isCombinator(selector[i + 1])) {
      return true
    }
  }
  return false
}

function isCombinator(x) {
  return (/[\s+>~]/.test(x)
  )
}
rule.primaryOptionArray = true;
rule.ruleName = ruleName;
rule.messages = messages;
module.exports = stylelint.createPlugin(ruleName, rule);
