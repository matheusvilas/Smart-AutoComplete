if (!Array.prototype.forEach) {
  Array.prototype.forEach = function (fn, scope) {
    for (var i = 0, len = this.length; i < len; ++i) {
      fn.call(scope, this[i], i, this);
    }
  };
}

$(document).ready(function () {
  var autocompleteResult = $("#js-autocomplete-result");
  var autocompleteInput = $("#js-autocomplete");
  var errorMsg = $("#error-msg");
  var maxSimilarityEnable = 0.3;

  var handleSimilarityAutocomplete = debounce(function (evt) {
    var inputText = evt.currentTarget.value;

    var similarityResult = getCitySimilaritySortedByText(inputText);

    mountResult(similarityResult);
  }, 1000);

  function getCitySimilaritySortedByText(inputText) {
    var similarityResult = [];

    jsonCities.forEach(function (city) {
      var similarityBetweenInputCity = stringSimilarity.compareTwoStrings(
        inputText,
        city.cidade
      );
      if (similarityBetweenInputCity > maxSimilarityEnable) {
        similarityResult.push({
          similarity: similarityBetweenInputCity,
          city: city.cidade,
        });
      }
    });

    return similarityResult.sort(function (a, b) {
      return a.similarity < b.similarity;
    });
  }

  function validateLengthOfInput(event) {
    if (event.length < 3) {
      errorMsg.text("Digite mais de três letras");
    } else {
      errorMsg.text("");
    }
  }

  function mountResult(allSimilarity) {
    removeAllResult();

    if (allSimilarity.length > 0) {
      allSimilarity.forEach(function (similarity) {
        autocompleteResult.append(
          "<li class='result'>" + similarity.city + "</li>"
        );
      });
    } else {
      errorMsg.text("Cidade não encontrada");
    }
  }

  function removeAllResult() {
    $(".result").remove();
  }

  function debounce(func, wait, immediate) {
    var timeout;
    return function () {
      var context = this,
        args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      }, wait);
      if (immediate && !timeout) func.apply(context, args);
    };
  }

  // events
  autocompleteInput.keyup(function (evt) {
    validateLengthOfInput(this.value);
    handleSimilarityAutocomplete(evt);
  });

  $(document).on("click", ".result", function (evt) {
    var selectedLocality = $(evt.currentTarget).text();
    autocompleteInput.val(selectedLocality);
    removeAllResult();
  });
});
