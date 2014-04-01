var parseData = function(sampleData){
  console.log("now we're parsing");
  var parsedData = {};
  parsedData.data = sampleData;

  return parsedData;
}

var drawGraph = function(sampleData, parsedData, divLocation){
  console.log("now we're graphing");
  xf = crossfilter(parsedData);

  var articleGroup = xf.dimension(function (d) {
    return d.GroupID;
  });

  var article = xf.dimension(function (d) {
    return d.DocumentID;
  });

  var topic = xf.dimension(function (d) {
    return d.TopicID;
  });

  var word = xf.dimension(function (d) {
    return d.word;
  });

  var dimGroup = word.group().reduceSum(function(d){
    return d.topicWordProb;
  });
      
  var fill = d3.scale.category20();

  var width = $('#cloud').width();{}
  var height = $('#cloud').height();

  var uniqueArticleGroups = articleGroup.group().top(Infinity);

  appendArticleGroups(uniqueArticleGroups, '#articleGroups');

  var selectedArticleGroup;
  var selectedArticle;
  var selectedTopic;
  
  var topics;

  $('.articleGroupChoice').on('click', function(){
      selectedArticleGroup = $(this).text();
      uniqueArticles = articlesFromArticleGroup(selectedArticleGroup);
      appendArticles(uniqueArticles, '#articles');
  }); 

  function appendArticleGroups(uniqueArticleGroups, location){
    uniqueArticleGroups.forEach(function(d){
      $(location).append("<a href='#' class='articleGroupChoice' data-id="+d.key+">"+d.key+"<\/a><\/br>");
    });
  }

  function appendArticles(uniqueArticles, location){
    $('#articles').empty();
    $('#topics').empty();
    $('#cloud').empty();
    uniqueArticles.forEach(function(d){
      $(location).append("<a href='#' class='articleChoice' data-id="+d.key+">"+d.key+"<\/a><\/br>");
    });

    $('.articleChoice').on('click', function(){
      selectedArticle = $(this).text();
      uniqueTopics = topicsFromArticle(selectedArticle);
      appendTopics(uniqueTopics, '#topics');
    });
  }

  function appendTopics(uniqueTopics, location){
    $('#topics').empty();
    $('#cloud').empty();
    uniqueTopics.forEach(function(d){
      $(location).append("<a href='#' class='topicChoice' data-id="+d.key+">"+d.key+"<\/a><\/br>");
    });
      $('.topicChoice').on('click', function(){
        selectedTopic = $(this).text();
        uniqueWords = wordsFromTopic(selectedTopic);
        update(uniqueWords, '#cloud');
      }); 
  }

  function articlesFromArticleGroup(article_group_id){
    articleGroup.filterAll();
    articleGroup.filterExact(article_group_id);
    return article.group().top(Infinity).filter(function(d){
      return d.value > 0;
    });
  }

  function topicsFromArticle(article_id){
    article.filterAll();
    article.filterExact(article_id);
    return topic.group().top(Infinity).filter(function(d){
      return d.value > 0;
    });
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