/** 
       * DO NOT TOUCH:
       * Parses the URL parameters to check for a dataset ID
       */
      function getURLParameter(name) {
        return decodeURI(
          (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
        );
      }

      /** 
       * DO NOT TOUCH:
       * If a "dataset" URL param exists, Graf.ly will load a user's dataset. 
       * If this URL param does not exist, Graf.ly will load YOUR sample_data.csv.
       */
      var dataset_id = getURLParameter("dataset");
            var csv_url = dataset_id != 'null' ? 
              'http://staging-grafly.herokuapp.com/uploads/s3_response/' + dataset_id : 
              'sample_data.csv';
          
            console.log('the CSV URL is: ' + csv_url);

            getData(ready);
            /** 
             * DO NOT TOUCH:
             * Waits for data to load asynchronosly, then executes the "ready" function. 
             * Place any code that needs access to data inside of the "ready" function.
             */

            function getData(callback){
              d3.csv(csv_url, function(error, csv){
                callback(error, csv);
              });
            }

      /**
       * PLACE JS CODE THAT NEEDS ACCESS TO DATA INSIDE THIS FUNCTION
       *
       * Data is loaded asynchronously. This "ready" function is called once
       * data has finished loading. It has access to the data in the variable "csv_data".
       * 
       * @param - error - returns any errors that may have occured while loading data.
       * @param - csv_data - the data from either sample_data.csv or the user's data.
       */
      function ready(error, csv_data){
        console.log('You now have access to data. We saved it in the variable csv_data.');
        // console.log(csv_data);
        var parsedData = parseData(csv_data);
        if (parsedData.passedTypeChecks == false){
          // console.log(parsedData);
          $('#chart').empty();
        }
        else {
          drawGraph(csv_data, parsedData.data, '#chart');
        }
      }