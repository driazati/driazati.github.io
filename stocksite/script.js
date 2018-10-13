d3.select("body")
    .style("height","100%")
    .style("font", "12px sans-serif")
    .append("input")
    .attr("type", "file")
    .attr("accept", ".csv")
    .style("margin", "5px")
    .on("change", function() {
        var file = d3.event.target.files[0];
        if (file) {
            var reader = new FileReader();
            reader.onloadend = function(evt) {
                var dataUrl = evt.target.result;
                // The following call results in an "Access denied" error in IE.
                readCSV(dataUrl);
            };
            reader.readAsDataURL(file);
        }
    });

function readCSV(url) {
    console.log("hello");
    d3.csv(url, function(rows) {
        console.log(rows[0]);
        d3.select("body").append("b").html(rowToHTML(rows[0]));
    });
}

function rowToHTML(row) {
    var result = "";
    for (key in row) {
        result += key + ": " + row[key] + "<br/>"
    }
    return result;
}