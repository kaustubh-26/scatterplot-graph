import * as d3 from 'd3';
import { useEffect } from 'react';
import './Scatterplot.css';

const Scatterplot = () => {
  const width = 840;
  const height = 500;

  useEffect(() => {
    if (d3.select('#title').empty()) {
      const svg = d3
        .select('.graph')
        .attr('width', width + 80)
        .attr('height', height + 130)
        .append('g')
        .attr('transform', 'translate(60,100)');

      const tooltip = d3
        .select('#tooltip')
        .attr('opacity', 0)
        .style('display', 'none');

      svg
        .append('text')
        .attr('id', 'title')
        .attr('x', '420')
        .attr('y', '-50')
        .style('text-anchor', 'middle')
        .text('Doping in Professional Bicycle Racing')
        .style('font-size', '30px');

      svg
        .append('text')
        .attr('x', '420')
        .attr('y', '-25')
        .style('text-anchor', 'middle')
        .text("35 Fastest times up Alpe d'Huez")
        .style('font-size', '20px');

      d3.json(
        'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json'
      ).then((data) => {
        data.map((d) => {
          d.Place = +d.Place;
          const splitTime = d.Time.split(':');
          d.Time = new Date(1970, 0, 1, 0, splitTime[0], splitTime[1]);
        });

        // X-axis
        const xScale = d3
          .scaleLinear()
          .domain([
            d3.min(data, (d) => {
              return d.Year - 1;
            }),
            d3.max(data, (d) => {
              return d.Year + 1;
            }),
          ])
          .range([0, width]);

        const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));

        svg
          .append('g')
          .call(xAxis)
          .attr('id', 'x-axis')
          .attr('transform', `translate(0,${height})`)
          .append('text')
          .attr('class', 'x-axis-label')
          .attr('x', width)
          .attr('y', -6)
          .style('text-anchor', 'end')
          .text('Year');

        // Y-axis
        const yScale = d3
          .scaleTime()
          .domain(
            d3.extent(data, (d) => {
              return d.Time;
            })
          )
          .range([0, height]);

        const yAxisFormat = d3.timeFormat('%M:%S');

        const yAxis = d3.axisLeft(yScale).tickFormat(yAxisFormat);

        svg
          .append('g')
          .call(yAxis)
          .attr('id', 'y-axis')
          .append('text')
          .attr('class', 'label')
          .attr('y', 6)
          .style('text-anchor', 'end')
          .attr('transform', `rotate(-90)`)
          .text('Best Time (minutes)');

        svg
          .append('text')
          .attr('x', '-160')
          .attr('y', '-44')
          .attr('transform', `rotate(-90)`)
          .text('Time in Minutes')
          .style('font-size', '18px');

        // Plot Data
        const color = d3.scaleOrdinal(d3.schemeCategory10);
        svg
          .selectAll('.dot')
          .data(data)
          .enter()
          .append('circle')
          .attr('class', 'dot')
          .attr('r', 6)
          .attr('cx', (d) => {
            return xScale(d.Year);
          })
          .attr('cy', (d) => {
            return yScale(d.Time);
          })
          .attr("data-xvalue", (d) => {
            return d.Year;
          })
          .attr("data-yvalue", (d) => {
            return d.Time.toISOString();
          })
          .attr('fill', (d) => {
            return color(d.Doping !== '');
          })
          .on('mouseover', (e, d) => {
            tooltip.style('opacity', 0.9).style('display', 'block');
            tooltip.attr('data-year', d.Year);
            tooltip
              .html(
                d.Name +
                  ': ' +
                  d.Nationality +
                  '<br/>' +
                  'Year: ' +
                  d.Year +
                  ', Time:' +
                  yAxisFormat(d.Time) +
                  (d.Doping ? '<br/><br/>' + d.Doping : '')
              )
              .style('left', e.pageX + 'px')
              .style('top', e.pageY - 28 + 'px');
          })
          .on('mouseout', (e, d) => {
            tooltip.style('opacity', 0).style('display', 'none');
          });

          // legend
          const legendDiv = svg.append("g").attr("id", "legend");

          const legend = legendDiv
          .selectAll("#legend")
          .data(color.domain())
          .enter()
          .append("g")
          .attr("transform", (_, i) => {
            return `translate(0,${height / 2 - i * 20 })`
          })


          legend
          .append("rect")
          .attr("x", width - 18)
          .attr("width", 18)
          .attr("height", 18)
          .attr("fill", color);

          legend
          .append("text")
          .attr("x", width - 24)
          .attr("y", 14)
          .style("text-anchor", "end")
          .text((d) => {
            if(d) {
              return "Riders with doping allegations";
            } else {
              return "No doping allegations";
            }
          });
      });
    }
  });

  return (
    <>
      <div id="tooltip"></div>
      <svg className="graph"></svg>
    </>
  );
};

export default Scatterplot;
