var width = document.getElementById('visual').clientWidth;
var height = document.getElementById('visual').clientHeight;

var margin = {
    top: 10,
    bottom: 70,
    left: 70,
    right: 20
}

var svg = d3.select('#visual')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.right + ')');

width = 1000 - margin.left - margin.right;
height = 400 - margin.top - margin.bottom;

var data = {};

var x_scale = d3.scaleBand()
    .rangeRound([0, width])
    .padding(0.1);

var y_scale = d3.scaleLinear()
    .range([height, 0]);

var colour_scale = d3.scaleQuantile()
    .range(['#F9CDAC', '#F3ACA2', '#EE8B97', '#E96A8D', '#DB5087', '#B8428C', '#973490', '#742796', '#5E1F88', '#4D1A70', '#3D1459', '#2D0F41']);

var y_axis = d3.axisLeft(y_scale);
var x_axis = d3.axisBottom(x_scale);

svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height + ')');

svg.append('g')
    .attr('class', 'y axis');

function pieData(Ap, A, Bp, Bm, F, year, program) {
    var div = d3.select("body").append("div")
        .attr("class", "tooltip-donut")
        .style("opacity", 0);
    var pieWidth = 400, pieHeight = 300;
    var colors = d3.scaleOrdinal(["#173F5F", "#20639B", "#3CAEA3", "#F6D55C", "#ED553B"]);
    var pieSvg = d3.select("svg").append("svg")
        .attr("width", pieWidth).attr("height", pieHeight)
        .style("background", "white")
        .attr("x", 1100)
        .attr("y", 0)
        .attr("class", "grades");

    d3.selectAll("svg.grades > *").remove();

    var details = [{ key: "A+", value: Ap },
    { key: "A", value: A },
    { key: "B+", value: Bp },
    { key: "B-", value: Bm },
    { key: "F", value: F }];

    var pieData = d3.pie().sort(null)
        .value(function (d) { return d.value })(details);

    var segments = d3.arc()
        .innerRadius(70)
        .outerRadius(100)
        .padAngle(.05)
        .padRadius(50);

    var sections = pieSvg.append("g")
        .attr("transform", "translate(180, 160)")
        .classed("grades_g", true)
        .selectAll("path").data(pieData);

    sections.enter().append("path").attr("class", "donutSegment")
        .attr("fill", function (d, i) { return colors(i); })
        .transition().delay(function (d, i) {
            return i * 50;
        }).duration(50)
        .attrTween('d', function (d) {
            var i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
            return function (t) {
                d.endAngle = i(t);
                return segments(d);
            }
        });
    d3.selectAll("path").on('mouseover', function (d, i) {
        d3.select(this).transition()
            .duration('50')
            .attr('opacity', '.85');
        //Makes the new div appear on hover:
        div.transition()
            .duration(50)
            .style("opacity", 1);

        div.html(d.value)
            .style("left", (d3.event.pageX + 10) + "px")
            .style("top", (d3.event.pageY - 15) + "px");

        let txt = ("Grade: " + d.data.key + "<br />" + "Students: " + d.data.value.toString());
        div.html(txt)
            .style("left", (d3.event.pageX + 10) + "px")
            .style("top", (d3.event.pageY - 15) + "px");
    })
        .on('mouseout', function (d, i) {
            d3.select(this).transition()
                .duration('50')
                .attr('opacity', '1');
            //Makes the new div disappear:
            div.transition()
                .duration('50')
                .style("opacity", 0);
        });

    var displayStr = program.toUpperCase() + " (" + year + ") GRADES";
    pieSvg.selectAll("text").data(details)
        .enter().append("text")
        .text(displayStr)
        .attr("x", "50%")
        .attr("y", 300)
        .attr("font-family", "sans-serif")
        .attr("font-size", "20px")
        .attr("text-anchor", "middle");
}

var currentYear = 2019

function getYear() {
    return(currentYear);
}

function draw(year) {

    var csv_data = data[year];
    currentYear = year;
    var div = d3.select("body").append("div")
        .attr("class", "tooltip-bar")
        .style("opacity", 0);

    var t = d3.transition()
        .duration(1000);

    var programs = csv_data.map(function (d) {
        return d.program;
    });
    x_scale.domain(programs);

    var max_value = d3.max(csv_data, function (d) {
        return +d.value;
    });

    y_scale.domain([0, max_value]);
    colour_scale.domain([0, max_value]);

    var bars = svg.selectAll('.bar')
        .data(csv_data)

    bars
        .exit()
        .remove();

    var new_bars = bars
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', function (d) {
            return x_scale(d.program);
        })
        .attr('width', x_scale.bandwidth())
        .attr('y', height)
        .attr('height', 0)
        .on('mouseover', function (d, i) {
            d3.select(this).transition()
                .duration('50')
                .attr('opacity', '.85');
            div.transition()
                .duration(50)
                .style("opacity", 1);

            div.html(d.value)
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 15) + "px");

            let num = (Math.round((d.value)).toString());
            div.html(num)
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 15) + "px");
        })
        .on('mouseout', function (d, i) {
            d3.select(this).transition()
                .duration('50')
                .attr('opacity', '1');
            div.transition()
                .duration('50')
                .style("opacity", 0);
        })
        .on('click', function (d) {
            pieData(d.Ap, d.A, d.Bp, d.Bm, d.F, getYear(), d.program);
        });

    new_bars.merge(bars)
        .transition(t)
        .attr('y', function (d) {
            return y_scale(+d.value);
        })
        .attr('height', function (d) {
            return height - y_scale(+d.value)
        })
        .attr('fill', function (d) {
            return colour_scale(+d.value);
        })

    svg.select('.x.axis')
        .call(x_axis);

    svg.select('.y.axis')
        .transition(t)
        .call(y_axis);


}

d3.queue()
    .defer(d3.csv, 'student_data_2019.csv')
    .defer(d3.csv, 'student_data_2018.csv')
    .defer(d3.csv, 'student_data_2017.csv')
    .defer(d3.csv, 'student_data_2016.csv')
    .defer(d3.csv, 'student_data_2015.csv')
    .defer(d3.csv, 'student_data_2014.csv')
    .await(function (error, d2019, d2018, d2017, d2016, d2015, d2014) {
        data['2014'] = d2014;
        data['2015'] = d2015;
        data['2016'] = d2016;
        data['2017'] = d2017;
        data['2018'] = d2018;
        data['2019'] = d2019;
        draw('2019');
    });

var slider = d3.select('#year');
slider.on('change', function () {
    draw(this.value);
});
