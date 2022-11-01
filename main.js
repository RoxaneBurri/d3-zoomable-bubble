import './style.css';
import javascriptLogo from './javascript.svg';
import { setupCounter } from './counter.js';

import * as d3 from 'd3';

function ZoomableCircle(pack, data, d3, width, height, color) {
  const root = pack(data);
  let focus = root;
  let view;

  const svg = d3
    .select('svg#graph')
    .attr('viewBox', `-${width / 2} -${height / 2} ${width} ${height}`)
    .style('display', 'block')
    .style('margin', '0 -14px')
    .style('background', color(0))
    .style('cursor', 'pointer')
    .on('click', (event) => zoom(event, root));

  const node = svg
    .append('g')
    .selectAll('circle')
    .data(root.descendants().slice(1))
    .join('circle')
    .attr('fill', (d) => (d.children ? color(d.depth) : 'white'))
    .attr('pointer-events', (d) => (!d.children ? 'none' : null))
    .on('mouseover', function () {
      d3.select(this).attr('stroke', '#000');
    })
    .on('mouseout', function () {
      d3.select(this).attr('stroke', null);
    })
    .on(
      'click',
      (event, d) => focus !== d && (zoom(event, d), event.stopPropagation())
    );

  const label = svg
    .append('g')
    .style('font', '10px sans-serif')
    .attr('pointer-events', 'none')
    .attr('text-anchor', 'middle')
    .selectAll('text')
    .data(root.descendants())
    .join('text')
    .style('fill-opacity', (d) => (d.parent === root ? 1 : 0))
    .style('display', (d) => (d.parent === root ? 'inline' : 'none'))
    .text((d) => d.data.name);

  return svg.node();
}

function _data(FileAttachment) {
  return FileAttachment('flare-2.json').json();
}

function _pack(d3, width, height) {
  return (data) =>
    d3.pack().size([width, height]).padding(3)(
      d3
        .hierarchy(data)
        .sum((d) => d.value)
        .sort((a, b) => b.value - a.value)
    );
}

function _width() {
  return 932;
}

function _height(width) {
  return width;
}

function _format(d3) {
  return d3.format(',d');
}

function _color(d3) {
  return d3
    .scaleLinear()
    .domain([0, 5])
    .range(['hsl(152,80%,80%)', 'hsl(228,30%,40%)'])
    .interpolate(d3.interpolateHcl);
}

function _d3(require) {
  return require('d3@6');
}
// pack, data, d3, width, height, color

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() {
    return this.url;
  }
  const fileAttachments = new Map([
    [
      'flare-2.json',
      {
        url: new URL('./data.json', import.meta.url),
        mimeType: null,
        toString,
      },
    ],
  ]);
  main.builtin(
    'FileAttachment',
    runtime.fileAttachments((name) => fileAttachments.get(name))
  );
  main.variable(observer()).define(['md'], _1);
  main
    .variable(observer('chart'))
    .define(
      'chart',
      ['pack', 'data', 'd3', 'width', 'height', 'color'],
      _chart
    );
  main.variable(observer('data')).define('data', ['FileAttachment'], _data);
  main
    .variable(observer('pack'))
    .define('pack', ['d3', 'width', 'height'], _pack);
  main.variable(observer('width')).define('width', _width);
  main.variable(observer('height')).define('height', ['width'], _height);
  main.variable(observer('format')).define('format', ['d3'], _format);
  main.variable(observer('color')).define('color', ['d3'], _color);
  main.variable(observer('d3')).define('d3', ['require'], _d3);
  return main;
}
