var parseData = function(sampleData){
  console.log("now we're parsing");
  var parsedData = {};
  var inputDataTypes = parsing.getTypesFromData(sampleData);
  var requiredData = {
    ordered:[
      ['string', 'date','number'],
      ['string', 'date','number'],
      ['string', 'date','number'],
      ['string', 'date','number'],
      ['number'],
      ['number']
    ]
  };
  if (parsing.typeChecker(inputDataTypes, requiredData)){
    parsedData.data = sampleData;
  } else {
    parsedData.passedTypeChecks = false;
    parsedData.inputDataTypes = inputDataTypes;
    parsedData.requiredData = requiredData;
  }

  return parsedData;
}

var drawGraph = function(sampleData, parsedData, divLocation){
  console.log("now we're graphing");
  xf = crossfilter(parsedData);

  var article = xf.dimension(function (d) {
    return d.article_id;
  });

  var topic = xf.dimension(function (d) {
    return d.topic_id;
  });

  var word = xf.dimension(function (d) {
    return d.word_name;
  });

  var dimGroup = word.group().reduceSum(function(d,i){
    return d.word_prob;
  });
      
  var fill = d3.scale.category20();

  var width = $('#cloud').width();
  var height = $('#cloud').height();

  var uniqueArticles = article.group().top(Infinity);

  appendArticles(uniqueArticles, '#articles');

  var selectedArticle;
  var selectedTopic;
  var topics;

  $('.articleChoice').on('click', function(){
      selectedArticle = $(this).text();
      uniqueTopics = topicsFromArticle(selectedArticle);
      appendTopics(uniqueTopics, '#topics');
  }); 

  function appendArticles(uniqueArticles, location){
    uniqueArticles.forEach(function(d){
      $(location).append("<a href='#' class='articleChoice'>"+d.key+"<\/a><\/br>");
    });
  }

  function appendTopics(uniqueTopics, location){
    $('#topics').empty();
    $('#cloud').empty();
    uniqueTopics.forEach(function(d){
      $(location).append("<a href='#' class='topicChoice'>"+d.key+"<\/a><\/br>");
    });

    $('.topicChoice').on('click', function(){
        selectedTopic = $(this).text();
        uniqueWords = wordsFromTopic(selectedTopic);
        update(uniqueWords, '#cloud');
    }); 
  }

  function topicsFromArticle(article_id){
    article.filterAll();
    article.filterExact(article_id);
    return topic.group().top(Infinity);
  }

  function wordsFromTopic(topic_id){
    topic.filterAll();
    topic.filterExact(topic_id);
    return dimGroup.top(200).filter(function(d){  
      return d.value > 0;
    });
  }

  function update(data, location){
        d3.layout.cloud().stop();
        $(location).empty();

        var data = JSON.parse( JSON.stringify( data ) );
        
        var xScale = d3.scale.linear()
                             .domain([d3.min(data, function(d) { return d.value; }), d3.max(data, function(d) { return d.value; })])
                             .range([10,100]);

        d3.layout.cloud().size([width, height])
          .timeInterval(2)
          .words(data)
          .fontSize(function(d) { return xScale(+d.value); })
          .text(function(d) { return d.key; })
          .rotate(function() { return ~~(Math.random() * 2) * 90; })
          .font("Impact")
          .on("end", draw)
          .start();

        function draw(words) {
          d3.select(location).append("svg")
              .attr("width", width)
              .attr("height", height)
            .append("g")
              .attr("transform", "translate(" + [width >> 1, height >> 1] + ")")
            .selectAll("text")
              .data(words)
            .enter().append("text")
              .transition()
                .duration(1000)
                .attr("transform", function(d) { return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"; })
              .style("font-size", function(d) { return xScale(d.value) + "px"; })
              .style("font-family", "Impact")
              .style("fill", function(d, i) { return fill(i); })
              .attr("text-anchor", "middle")
              .attr("transform", function(d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
              })
              .text(function(d) { return d.key; });
        }
      };
}